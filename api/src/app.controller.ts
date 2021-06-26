import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { DbService } from './data/db.service';
import { AddPixelsRequest } from './models/dtos/add-pixels-request.dto';
import { ConfirmIncrementRequest } from './models/dtos/confirm-increment-request.dto';
import { CreateLobbyRequest } from './models/dtos/create-lobby-request.dto';
import { LobbyResponse } from './models/dtos/lobby-response.dto';

@Controller('lobby')
export class AppController {
  private readonly _dbService: DbService;

  constructor(dbService: DbService) {
    this._dbService = dbService;
  }

  @Get(':lobbyId')
  async getLobby(@Param('lobbyId') lobbyId: string): Promise<LobbyResponse> {
    return this._dbService.getLobby(lobbyId);
  }

  @Post()
  async postLobby(@Body() request: CreateLobbyRequest): Promise<void> {
    return this._dbService.createLobby(request);
  }

  @Post('increment')
  async addPointsToLobby(@Body() request: AddPixelsRequest): Promise<void> {
    return this._dbService.addIncrement(request);
  }

  @Patch('increment/confirm')
  async confirmIncrement(@Body() request: ConfirmIncrementRequest): Promise<void> {
    return this._dbService.confirmIncrement(request);
  }
}
