import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';

async function bootstrap() {
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
  const logger = new Logger('Users-MS')

  await app.listen();
  logger.log(`Microservice is listening on port ${envs.port}`);
}
bootstrap();
