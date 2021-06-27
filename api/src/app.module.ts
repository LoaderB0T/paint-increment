import { Module } from '@nestjs/common';
import { LobbyController } from './lobby.controller';
import { DbService } from './services/db.service';
import { LobbyService } from './services/lobby.service';

@Module({
  imports: [],
  controllers: [LobbyController],
  providers: [DbService, LobbyService]
})
export class AppModule {}
