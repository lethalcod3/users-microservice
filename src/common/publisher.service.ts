import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
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
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper | undefined;
  private readonly EXCHANGE_NAME = 'riff_events';
  private ready = false;

  async onModuleInit() {
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
        this.ready = true;
        this.logger.log(`Exchange ${this.EXCHANGE_NAME} asegurado`);
      },
    });

    await this.channelWrapper.waitForConnect();
    this.logger.log('PublisherService listo para publicar eventos');
  }

  async onModuleDestroy() {
    this.logger.log('Cerrando conexión a RabbitMQ...');
    await this.channelWrapper?.close();
    await this.connection.close();
  }

  /**
   * Publica un mensaje al exchange riff_events con una routing key específica
   */
  async publish(routingKey: string, payload: unknown): Promise<void> {
    if (!this.channelWrapper || !this.ready) {
      this.logger.warn(
        `PublisherService no está listo, omitiendo evento: ${routingKey}`
      );
      return;
    }

    try {
      const envelope = { pattern: routingKey, data: payload };
      await this.channelWrapper.publish(
        this.EXCHANGE_NAME,
        routingKey,
        Buffer.from(JSON.stringify(envelope)),
        {
          persistent: true,
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
