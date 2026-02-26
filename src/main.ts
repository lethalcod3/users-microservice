import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Users-MS');

  const app = await NestFactory.create(AppModule);

  // Conectar TCP para comunicación con el Gateway
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: envs.host,
      port: envs.port,
    },
  });

  // Conectar RabbitMQ como microservicio
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [envs.rabbit_url],
      queue: 'riff_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.startAllMicroservices();

  logger.log(`TCP microservice listening on ${envs.host}:${envs.port}`);
  logger.log(`RabbitMQ connected`);
}

bootstrap();
