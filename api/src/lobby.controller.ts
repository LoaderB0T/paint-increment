import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LobbyService } from './services/lobby.service';
import { AddPixelsRequest } from './models/dtos/add-pixels-request.dto';
import { ConfirmIncrementRequest } from './models/dtos/confirm-increment-request.dto';
import { CreateLobbyRequest } from './models/dtos/create-lobby-request.dto';
import { LobbyResponse } from './models/dtos/lobby-response.dto';
import { NewInviteCodeRequestDto } from './models/dtos/new-invite-code-request.dto';
import { NewInviteCodeResponseDto } from './models/dtos/new-invite-code-response.dto';
import { ValidateInviteCodeRequestDto } from './models/dtos/validate-invite-code-request.dto';
import { ValidateInviteCodeResponseDto } from './models/dtos/validate-invite-code-response.dto';
import { ConfigService } from './services/config.service';
import { ValidateCreatorSecretRequestDto } from './models/dtos/validate-creator-secret-request.dto';
import { ValidateCreatorSecretResponseDto } from './models/dtos/validate-creator-secret-response.dto';
import { safeLobbyName } from './util/safe-lobby-name';
import { AuthGuard } from './auth/auth.guard';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { Session } from './auth/session.decorator';
import { getUserById } from 'supertokens-node/recipe/thirdparty';

@Controller('lobby')
export class LobbyController {
  private readonly _lobbyService: LobbyService;
  private readonly _configService: ConfigService;

  constructor(lobbyService: LobbyService, configService: ConfigService) {
    this._lobbyService = lobbyService;
    this._configService = configService;
  }

  @Get('test')
  @UseGuards(new AuthGuard())
  async test(@Session() session: SessionContainer) {
    const userInfo = await getUserById(session.getUserId());
    console.log(userInfo);
    return 'test';
  }

  @Get(':lobbyId')
  async getLobby(
    @Param('lobbyId') lobbyId: string,
    @Session() session: SessionContainer
  ): Promise<LobbyResponse> {
    const userInfo = await getUserById(session.getUserId());
    return this._lobbyService.getLobby(lobbyId, userInfo);
  }

  @Post('invite')
  @UseGuards(new AuthGuard())
  async generateInvite(
    @Body() request: NewInviteCodeRequestDto,
    @Session() session: SessionContainer
  ): Promise<NewInviteCodeResponseDto> {
    const userInfo = await getUserById(session.getUserId());
    return this._lobbyService.generateInvite(request, userInfo);
  }

  @Post('invite/validate')
  async validateInvite(
    @Body() request: ValidateInviteCodeRequestDto
  ): Promise<ValidateInviteCodeResponseDto> {
    return this._lobbyService.inviteValid(request);
  }

  @Post('validateCreator')
  @UseGuards(new AuthGuard())
  async validateCreator(
    @Body() request: ValidateCreatorSecretRequestDto,
    @Session() session: SessionContainer
  ): Promise<ValidateCreatorSecretResponseDto> {
    const userInfo = await getUserById(session.getUserId());
    return this._lobbyService.validateCreator(request, userInfo);
  }

  @Post()
  @UseGuards(new AuthGuard())
  async postLobby(
    @Body() request: CreateLobbyRequest,
    @Session() session: SessionContainer
  ): Promise<LobbyResponse> {
    const userInfo = await getUserById(session.getUserId());
    if (!userInfo) {
      throw new Error('User not found');
    }
    return this._lobbyService.createLobby(request, userInfo.email);
  }

  @Post('increment')
  async addPointsToLobby(@Body() request: AddPixelsRequest): Promise<void> {
    return this._lobbyService.addIncrement(request);
  }

  @Patch('increment/confirm')
  @UseGuards(new AuthGuard())
  async confirmIncrement(
    @Body() request: ConfirmIncrementRequest,
    @Session() session: SessionContainer
  ): Promise<void> {
    const userInfo = await getUserById(session.getUserId());
    return this._lobbyService.confirmIncrement(request, userInfo);
  }

  @Get('accept/:lobbyId/:code')
  async acceptInvite(@Param('lobbyId') lobbyId: string, @Param('code') code: string) {
    const lobby = await this._lobbyService.acceptInvite(lobbyId, code);
    const url = `${this._configService.config.clientAddress}/lobby/${safeLobbyName(lobby.name)}/${
      lobby.id
    }?confirmed=true`;
    return `<script>window.location.href = "${url}";</script>`;
  }

  @Get('reject/:lobbyId/:code')
  async rejectInvite(@Param('lobbyId') lobbyId: string, @Param('code') code: string) {
    const lobby = await this._lobbyService.rejectInvite(lobbyId, code);
    const url = `${this._configService.config.clientAddress}/lobby/${safeLobbyName(lobby.name)}/${
      lobby.id
    }?rejected=true`;
    return `<script>window.location.href = "${url}";</script>`;
  }
}
