import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DbService } from './data/db.service';
import { CreateLobbyRequest } from './models/dtos/create-lobby-request.dto';

@Controller()
export class AppController {
  private readonly _appService: AppService;
  private readonly _dbService: DbService;

  constructor(appService: AppService, dbService: DbService) {
    this._appService = appService;
    this._dbService = dbService;
  }

  @Get('lobby/:lobbyId')
  async getLobby(@Param('lobbyId') lobbyId: string): Promise<string> {
    return this._dbService.getLobby(lobbyId);
  }

  @Post('lobby')
  async postLobby(@Body() request: CreateLobbyRequest): Promise<void> {
    return this._dbService.createLobby(request);
  }
}
