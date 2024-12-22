import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import Session, { SessionContainer } from 'supertokens-node/recipe/session';

import { AuthGuard } from './auth/auth.guard.js';
import { Session as SessionDecorator } from './auth/session.decorator.js';
import { AddPixelsRequest } from './models/dtos/add-pixels-request.dto.js';
import { ConfirmIncrementRequest } from './models/dtos/confirm-increment-request.dto.js';
import { CreateLobbyRequest } from './models/dtos/create-lobby-request.dto.js';
import { EditPixelsRequest } from './models/dtos/edit-pixels-request.dto.js';
import { LobbyPreviewResponse } from './models/dtos/lobby-preview-response.dto.js';
import { LobbyResponse } from './models/dtos/lobby-response.dto.js';
import { NewInviteCodeRequestDto } from './models/dtos/new-invite-code-request.dto.js';
import { NewInviteCodeResponseDto } from './models/dtos/new-invite-code-response.dto.js';
import { ValidateCreatorSecretRequestDto } from './models/dtos/validate-creator-secret-request.dto.js';
import { ValidateCreatorSecretResponseDto } from './models/dtos/validate-creator-secret-response.dto.js';
import { ValidateInviteCodeRequestDto } from './models/dtos/validate-invite-code-request.dto.js';
import { ValidateInviteCodeResponseDto } from './models/dtos/validate-invite-code-response.dto.js';
import { ConfigService } from './services/config.service.js';
import { LobbyService } from './services/lobby.service.js';
import { getUserInfo } from './util/get-user-info.js';
import { safeLobbyName } from './util/safe-lobby-name.js';

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
  async getLobby(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('lobbyId') lobbyId: string
  ): Promise<LobbyResponse> {
    const session = await Session.getSession(req, res, { sessionRequired: false });
    const userInfo = session ? await getUserInfo(session.getUserId()) : undefined;

    return this._lobbyService.getLobby(lobbyId, userInfo);
  }

  @Post('invite')
  @UseGuards(new AuthGuard())
  async generateInvite(
    @Body() request: NewInviteCodeRequestDto,
    @SessionDecorator() session: SessionContainer
  ): Promise<NewInviteCodeResponseDto> {
    const userInfo = await getUserInfo(session.getUserId());
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
    @SessionDecorator() session: SessionContainer
  ): Promise<ValidateCreatorSecretResponseDto> {
    const userInfo = await getUserInfo(session.getUserId());
    return this._lobbyService.validateCreator(request, userInfo);
  }

  @Post()
  @UseGuards(new AuthGuard())
  async postLobby(
    @Body() request: CreateLobbyRequest,
    @SessionDecorator() session: SessionContainer
  ): Promise<LobbyResponse> {
    const userInfo = await getUserInfo(session.getUserId());
    if (!userInfo) {
      throw new Error('User not found');
    }
    return this._lobbyService.createLobby(request, userInfo.email);
  }

  @Post('increment')
  async addPointsToLobby(
    @Body() request: AddPixelsRequest,

    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const session = await Session.getSession(req, res, { sessionRequired: false });
    const userInfo = session ? await getUserInfo(session.getUserId()) : undefined;
    return this._lobbyService.addIncrement(request, userInfo);
  }

  @Patch('increment')
  @UseGuards(new AuthGuard())
  async editLobbyPoints(
    @Body() request: EditPixelsRequest,
    @SessionDecorator() session: SessionContainer
  ): Promise<void> {
    const userInfo = await getUserInfo(session.getUserId());
    if (!userInfo) {
      throw new Error('User not found');
    }
    return this._lobbyService.editIncrement(request, userInfo);
  }

  @Patch('increment/confirm')
  @UseGuards(new AuthGuard())
  async confirmIncrement(
    @Body() request: ConfirmIncrementRequest,
    @SessionDecorator() session: SessionContainer
  ): Promise<void> {
    const userInfo = await getUserInfo(session.getUserId());
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

  @Post('my-lobbies')
  @UseGuards(new AuthGuard())
  async myLobbies(@SessionDecorator() session: SessionContainer): Promise<LobbyPreviewResponse[]> {
    const userInfo = await getUserInfo(session.getUserId());
    if (!userInfo) {
      throw new Error('User not found');
    }
    return this._lobbyService.getLobbiesOfUser(userInfo);
  }
}
