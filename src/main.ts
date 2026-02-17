import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Users-MS');

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [envs.rabbit_url],
      queue: 'notifications.queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  //Inicia Rabitt
  await app.startAllMicroservices();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options:{
        host: envs.host,
        port: envs.port
      }
    }
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  const logger = new Logger('Users-MS')

  await app.startAllMicroservices();

  await app.listen(envs.port);
  logger.log(`Microservice is listening on port ${envs.port}`);
}
bootstrap();
