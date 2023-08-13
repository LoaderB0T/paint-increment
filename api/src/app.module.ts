import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { LobbyController } from './lobby.controller';
import { DbService } from './services/db.service';
import { LobbyGateway } from './lobby.gateway';
import { LobbyService } from './services/lobby.service';
import { MailService } from './services/mail.service';
import { WsService } from './services/ws.service';
import { IterationEditGateway } from './iteration-edit.gateway';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [AuthController, LobbyController],
  providers: [DbService, LobbyService, MailService, WsService, LobbyGateway, IterationEditGateway],
})
export class AppModule {}
