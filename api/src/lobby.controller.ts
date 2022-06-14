import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { LobbyService } from './services/lobby.service';
import { AddPixelsRequest } from './models/dtos/add-pixels-request.dto';
import { ConfirmIncrementRequest } from './models/dtos/confirm-increment-request.dto';
import { CreateLobbyRequest } from './models/dtos/create-lobby-request.dto';
import { LobbyResponse } from './models/dtos/lobby-response.dto';
import { NewInviteCodeRequestDto } from './models/dtos/new-invite-code-request.dto';
import { NewInviteCodeResponseDto } from './models/dtos/new-invite-code-response.dto';
import { ValidateInviteCodeRequestDto } from './models/dtos/validate-invite-code-request.dto';
import { ValidateInviteCodeResponseDto } from './models/dtos/validate-invite-code-response.dto';
import { LobbyNameAvailableRequestDto } from './models/dtos/lobby-name-available-request.dto';
import { ConfigService } from './services/config.service';
import { ValidateCreatorSecretRequestDto } from './models/dtos/validate-creator-secret-request.dto';
import { ValidateCreatorSecretResponseDto } from './models/dtos/validate-creator-secret-response.dto';

@Controller('lobby')
export class LobbyController {
  private readonly _lobbyService: LobbyService;
  private readonly _configService: ConfigService;

  constructor(lobbyService: LobbyService, configService: ConfigService) {
    this._lobbyService = lobbyService;
    this._configService = configService;
  }

  @Get('test')
  async test() {
    return 'test';
  }

  @Get(':lobbyId')
  async getLobby(@Param('lobbyId') lobbyId: string, @Query('uid') uid: string): Promise<LobbyResponse> {
    return this._lobbyService.getLobby(lobbyId, uid);
  }

  @Post('available')
  async lobbyNameAvailable(@Body() request: LobbyNameAvailableRequestDto): Promise<boolean> {
    return this._lobbyService.lobbyNameAvailable(request);
  }

  @Post('invite')
  async generateInvite(@Body() request: NewInviteCodeRequestDto): Promise<NewInviteCodeResponseDto> {
    return this._lobbyService.generateInvite(request);
  }

  @Post('invite/validate')
  async validateInvite(@Body() request: ValidateInviteCodeRequestDto): Promise<ValidateInviteCodeResponseDto> {
    return this._lobbyService.inviteValid(request);
  }

  @Post('creatorSecret/validate')
  async validateCreatorSecret(@Body() request: ValidateCreatorSecretRequestDto): Promise<ValidateCreatorSecretResponseDto> {
    return this._lobbyService.creatorSecretValid(request);
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

  @Get('accept/:lobbyId/:code')
  async acceptInvite(@Param('lobbyId') lobbyId: string, @Param('code') code: string) {
    await this._lobbyService.acceptInvite(lobbyId, code);
    const url = `${this._configService.config.clientAddress}/lobby/${lobbyId}?confirmed=true`;
    return `<script>window.location.href = "${url}";</script>`;
  }

  @Get('reject/:lobbyId/:code')
  async rejectInvite(@Param('lobbyId') lobbyId: string, @Param('code') code: string) {
    await this._lobbyService.rejectInvite(lobbyId, code);
    const url = `${this._configService.config.clientAddress}/lobby/${lobbyId}?rejected=true`;
    return `<script>window.location.href = "${url}";</script>`;
  }
}
