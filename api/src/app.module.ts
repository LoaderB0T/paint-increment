import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbService } from './data/db.service';
import { LobbyService } from './data/lobby.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [DbService, LobbyService]
})
export class AppModule {}
