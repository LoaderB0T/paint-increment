import { Module } from '@nestjs/common';
import { LobbyController } from './lobby.controller';
import { ConfigService } from './services/config.service';
import { DbService } from './services/db.service';
import { LobbyGateway } from './lobby.gateway';
import { LobbyService } from './services/lobby.service';
import { MailService } from './services/mail.service';
import { WsService } from './services/ws.service';
import { IterationEditGateway } from './iteration-edit.gateway';

@Module({
  imports: [],
  controllers: [LobbyController],
  providers: [DbService, LobbyService, ConfigService, MailService, WsService, LobbyGateway, IterationEditGateway]
})
export class AppModule {}
