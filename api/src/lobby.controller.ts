import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LobbyService } from './services/lobby.service';
import { AddPixelsRequest } from './models/dtos/add-pixels-request.dto';
import { ConfirmIncrementRequest } from './models/dtos/confirm-increment-request.dto';
import { CreateLobbyRequest } from './models/dtos/create-lobby-request.dto';
import { LobbyResponse } from './models/dtos/lobby-response.dto';
import { NewInviteCodeRequestDto } from './models/dtos/new-invite-code-request.dto';
import { NewInviteCodeResponseDto } from './models/dtos/new-invite-code-response.dto';
import { ValdiateInviteCodeRequestDto } from './models/dtos/valdiate-invite-code-request.dto';
import { ValidateInviteCodeResponseDto } from './models/dtos/valdiate-invite-code-response.dto';

@Controller('lobby')
export class LobbyController {
  private readonly _lobbyService: LobbyService;

  constructor(lobbyService: LobbyService) {
    this._lobbyService = lobbyService;
  }

  @Get(':lobbyId')
  async getLobby(@Param('lobbyId') lobbyId: string): Promise<LobbyResponse> {
    return this._lobbyService.getLobby(lobbyId);
  }

  @Post('invite')
  async generateInvite(@Body() request: NewInviteCodeRequestDto): Promise<NewInviteCodeResponseDto> {
    return this._lobbyService.generateInvite(request);
  }

  @Post('invite/validate')
  async validateInvite(@Body() request: ValdiateInviteCodeRequestDto): Promise<ValidateInviteCodeResponseDto> {
    return this._lobbyService.inviteValid(request);
  }

  @Post()
  async postLobby(@Body() request: CreateLobbyRequest): Promise<LobbyResponse> {
    return this._lobbyService.createLobby(request);
  }

  @Post('increment')
  async addPointsToLobby(@Body() request: AddPixelsRequest): Promise<void> {
    return this._lobbyService.addIncrement(request);
  }

  @Patch('increment/confirm')
  async confirmIncrement(@Body() request: ConfirmIncrementRequest): Promise<void> {
    return this._lobbyService.confirmIncrement(request);
  }
}
