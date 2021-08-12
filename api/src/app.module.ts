import { Module } from '@nestjs/common';
import { LobbyController } from './lobby.controller';
import { LobbyGateway } from './lobby.gateway';
import { ConfigService } from './services/config.service';
import { DbService } from './services/db.service';
import { LobbyService } from './services/lobby.service';
import { MailService } from './services/mail.service';

@Module({
  imports: [],
  controllers: [LobbyController],
  providers: [DbService, LobbyService, ConfigService, MailService, LobbyGateway]
})
export class AppModule {}
