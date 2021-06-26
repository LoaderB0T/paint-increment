import { Module } from '@nestjs/common';
import { LobbyController } from './lobby.controller';
import { DbService } from './data/db.service';
import { LobbyService } from './data/lobby.service';

@Module({
  imports: [],
  controllers: [LobbyController],
  providers: [DbService, LobbyService]
})
export class AppModule {}
