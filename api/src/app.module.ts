import { Module } from '@nestjs/common';

import { AuthController } from './auth/auth.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from './config.module.js';
import { IterationEditGateway } from './iteration-edit.gateway.js';
import { LobbyController } from './lobby.controller.js';
import { LobbyGateway } from './lobby.gateway.js';
import { DbService } from './services/db.service.js';
import { LobbyService } from './services/lobby.service.js';
import { MailService } from './services/mail.service.js';
import { WsService } from './services/ws.service.js';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [AuthController, LobbyController],
  providers: [DbService, LobbyService, MailService, WsService, LobbyGateway, IterationEditGateway],
})
export class AppModule {}
