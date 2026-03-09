import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TokenGeneratedEventDto } from './dto/token-generated-event.dto';

@Controller()
export class AuthEventsController {
  private readonly logger = new Logger('AuthEventsController');

  @EventPattern('auth.tokenGenerated')
  handleAuthTokenGenerated(@Payload() data: TokenGeneratedEventDto) {
    this.logger.log('Evento recibido — auth.tokenGenerated');
    this.logger.debug(JSON.stringify(data));
  }
}
