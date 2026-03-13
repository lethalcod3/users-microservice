import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { envs } from '../config';

/**
 * Servicio de publicación al exchange riff_events.
 * Mantiene una conexión persistente y reutilizable para publicar eventos.
 */
@Injectable()
export class PublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('PublisherService');
  private connection: amqp.AmqpConnectionManager | undefined;
  private channelWrapper: ChannelWrapper | undefined;
  private readonly EXCHANGE_NAME = 'riff_events';
  private ready = false;
  private initInFlight: Promise<void> | undefined;

  async onModuleInit() {
    await this.ensurePublisherInitialized();
  }

  async onModuleDestroy() {
    this.logger.log('Cerrando conexión a RabbitMQ...');
    await this.channelWrapper?.close();
    await this.connection?.close();
  }

  private async ensurePublisherInitialized() {
    if (this.channelWrapper) return;

    if (this.initInFlight) {
      await this.initInFlight;
      return;
    }

    this.initInFlight = (async () => {
      this.logger.log('Inicializando conexión a RabbitMQ para publicación...');

      this.connection = amqp.connect([envs.rabbit_url]);

      this.connection.on('connect', () => {
        this.logger.log('✅ Conexión a RabbitMQ establecida (Publisher)');
      });

      this.connection.on('disconnect', (err) => {
        this.logger.warn('⚠️ Desconectado de RabbitMQ', err?.err?.message);
        this.ready = false;
      });

      this.channelWrapper = this.connection.createChannel({
        json: false,
        setup: async (channel: Channel) => {
          await channel.assertExchange(this.EXCHANGE_NAME, 'topic', {
            durable: true,
          });

          // Helps diagnose missing bindings/routing keys from broker side.
          channel.removeAllListeners('return');
          channel.on('return', (msg) => {
            this.logger.error(
              `Mensaje no enrutable en RabbitMQ. exchange=${msg.fields.exchange} routingKey=${msg.fields.routingKey}`
            );
            this.logger.error(
              `Payload no enrutable: ${msg.content.toString()}`
            );
          });

          this.ready = true;
          this.logger.log(`Exchange ${this.EXCHANGE_NAME} asegurado`);
        },
      });

      await this.channelWrapper.waitForConnect();
      this.logger.log('PublisherService listo para publicar eventos');
    })();

    try {
      await this.initInFlight;
    } finally {
      this.initInFlight = undefined;
    }
  }

  /**
   * Publica un mensaje al exchange riff_events con una routing key específica
   */
  async publish(routingKey: string, payload: unknown): Promise<void> {
    if (!this.channelWrapper) {
      await this.ensurePublisherInitialized();
    }

    if (!this.channelWrapper) {
      const message = `PublisherService sin canal para publicar evento: ${routingKey}`;
      this.logger.error(message);
      throw new ServiceUnavailableException(message);
    }

    if (!this.ready) {
      this.logger.warn(
        `PublisherService no listo, esperando reconexión para evento: ${routingKey}`
      );
      try {
        await this.channelWrapper.waitForConnect();
        this.ready = true;
        this.logger.log(
          'PublisherService reconectado, reintentando publicación'
        );
      } catch (error) {
        const message = `PublisherService no está listo para publicar evento: ${routingKey}`;
        this.logger.error(
          `${message}. Detalle: ${error instanceof Error ? error.message : String(error)}`
        );
        throw new ServiceUnavailableException(message);
      }
    }

    try {
      const envelope = { pattern: routingKey, data: payload };
      await this.channelWrapper.publish(
        this.EXCHANGE_NAME,
        routingKey,
        Buffer.from(JSON.stringify(envelope)),
        {
          persistent: true,
          mandatory: true,
          contentType: 'application/json',
        }
      );
      this.logger.log(` Evento publicado: ${routingKey}`);
      this.logger.debug(`Payload: ${JSON.stringify(payload)}`);
    } catch (error) {
      this.logger.error(
        `Error publicando evento ${routingKey}:`,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
}
