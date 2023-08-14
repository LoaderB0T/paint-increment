import { Injectable } from '@nestjs/common';
import { createCanvas } from 'canvas';
import { id } from '../util/id';

import { AddPixelsRequest } from '../models/dtos/add-pixels-request.dto';
import { ConfirmIncrementRequest } from '../models/dtos/confirm-increment-request.dto';
import { CreateLobbyRequest } from '../models/dtos/create-lobby-request.dto';
import { LobbyResponse } from '../models/dtos/lobby-response.dto';
import { NewInviteCodeRequestDto } from '../models/dtos/new-invite-code-request.dto';
import { NewInviteCodeResponseDto } from '../models/dtos/new-invite-code-response.dto';
import { ValidateCreatorSecretRequestDto } from '../models/dtos/validate-creator-secret-request.dto';
import { ValidateCreatorSecretResponseDto } from '../models/dtos/validate-creator-secret-response.dto';
import { ValidateInviteCodeRequestDto } from '../models/dtos/validate-invite-code-request.dto';
import { ValidateInviteCodeResponseDto } from '../models/dtos/validate-invite-code-response.dto';
import { PaintIncrement } from '../models/paint-increment.model';
import { PaintLobbySettings } from '../models/paint-lobby-settings.model';
import { PaintLobby } from '../models/paint-lobby.model';
import { WsState } from '../models/ws-state.model';
import { ConfigService } from './config.service';
import { DbService } from './db.service';
import { MailService } from './mail.service';
import { safeLobbyName } from '../util/safe-lobby-name';
import { UserInfo } from '../auth/user-info.dto';
import { LobbyPreviewResponse } from '../models/dtos/lobby-preview-response.dto';

@Injectable()
export class LobbyService {
  private readonly _dbService: DbService;
  private readonly _mailService: MailService;
  private readonly _configService: ConfigService;

  constructor(dbService: DbService, mailService: MailService, configService: ConfigService) {
    this._dbService = dbService;
    this._mailService = mailService;
    this._configService = configService;
  }

  async createLobby(request: CreateLobbyRequest, email: string) {
    const settings: PaintLobbySettings = {
      height: request.settings.height ?? 128,
      width: request.settings.height ?? 128,
      maxPixels: request.settings.maxPixels,
      timeLimit: request.settings.timeLimit ?? 15,
    };

    if (!settings.maxPixels || settings.maxPixels < 1) {
      throw new Error('Max pixels must be greater than 0');
    }

    const lobby: PaintLobby = {
      id: id(),
      name: request.name,
      increments: [],
      settings,
      creatorEmail: email,
      inviteCodes: [],
    };

    await this._dbService.lobbies.insertOne(lobby);

    const url = this._configService.config.clientAddress;
    const lobbyUrl = `${url}/lobby/${safeLobbyName(lobby.name)}/${lobby.id}`;

    const html = `
    <h1>paint.awdware.de</h1>
    <h2>Hi, ${request.ownerName}. You just successfully created the lobby '${lobby.name}'.</h2>
    
    <p>
      You can view the lobby with the following link:
      <a href="${lobbyUrl}">Lobby link</a>
    </p>

    `;

    this._mailService.sendMail(lobby.creatorEmail, 'Lobby created - paint.awdware.de', html);

    const res: LobbyResponse = {
      id: lobby.id,
      name: lobby.name,
      pixelIterations: [],
      settings: lobby.settings,
      isCreator: true,
    };
    return res;
  }

  async generateInvite(
    request: NewInviteCodeRequestDto,
    user?: UserInfo
  ): Promise<NewInviteCodeResponseDto> {
    if (!user) {
      throw new Error('Cannot create invite if not logged in');
    }
    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id ${request.lobbyId}`);
    }
    if (lobby.creatorEmail !== user.email) {
      throw new Error('Cannot edit lobby if not creator');
    }
    const newCode = id();

    await this._dbService.lobbies.updateOne(
      { id: request.lobbyId },
      {
        $push: { inviteCodes: newCode },
      }
    );

    return { inviteCode: newCode };
  }

  async inviteValid(request: ValidateInviteCodeRequestDto): Promise<ValidateInviteCodeResponseDto> {
    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id${request.lobbyId}`);
    }

    return { isValid: lobby.inviteCodes.some(x => x === request.inviteCode) };
  }

  async validateCreator(
    request: ValidateCreatorSecretRequestDto,
    user?: UserInfo
  ): Promise<ValidateCreatorSecretResponseDto> {
    if (!user) {
      return { isValid: false };
    }
    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id ${request.lobbyId}`);
    }
    const isValid = lobby.creatorEmail === user.email;
    return { isValid };
  }

  async getLobby(lobbyId: string, user?: UserInfo): Promise<LobbyResponse> {
    const lobby = await this._dbService.lobbies.findOne({ id: lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id ${lobbyId}`);
    }
    const res: LobbyResponse = {
      id: lobby.id,
      name: lobby.name,
      pixelIterations: lobby.increments.map(i => {
        return {
          confirmed: i.confirmed,
          name: i.name,
          id: i.id,
          pixels: i.pixels.map(ip => {
            return { x: ip[0], y: ip[1] };
          }),
        };
      }),
      settings: lobby.settings,
      isCreator: lobby.creatorEmail === user?.email,
    };
    return res;
  }

  public async invalidateInvite(lobbyId: string, code: string) {
    await this._dbService.lobbies.updateOne(
      { id: lobbyId },
      {
        $pull: { inviteCodes: code },
      }
    );
  }

  public async addIncrement(request: AddPixelsRequest, user?: UserInfo) {
    const newIncrement: PaintIncrement = {
      name: request.name,
      id: id(),
      email: request.email,
      pixels: request.pixels.map(p => [p.x, p.y]),
      confirmed: false,
      confirmCode: id(),
    };

    const lobby = await this.validateNewIncrement(request, newIncrement, user);

    if (request.inviteCode) {
      await this.invalidateInvite(lobby.id, request.inviteCode);
    }

    await this._dbService.lobbies.updateOne(
      { id: request.lobbyId },
      {
        $push: { increments: newIncrement },
      }
    );

    const lockData = WsState.lockState[request.lobbyId];
    WsState.deleteTimeout(lockData);

    const imgData = this.getImageDataForNewIncrement(lobby, newIncrement);
    const url = this._configService.config.ownAddress;
    const acceptUrl = `${url}/lobby/accept/${lobby.id}/${newIncrement.confirmCode}`;
    const rejectUrl = `${url}/lobby/reject/${lobby.id}/${newIncrement.confirmCode}`;

    const html = `
    <h2>${request.name} has added a new iteration to ${lobby.name}</h2>
    <img src="cid:1">
    <a href="${acceptUrl}">Accept</a>
    <a href="${rejectUrl}">Reject</a>
    `;

    this._mailService.sendMail(lobby.creatorEmail, 'New iteration added to lobby', html, imgData);
  }

  private getImageDataForNewIncrement(lobby: PaintLobby, newIncrement: PaintIncrement) {
    const canvasSize = 2048;
    const pixelSize = canvasSize / lobby.settings.width;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = 'black';

    lobby.increments.forEach(x => {
      x.pixels.forEach(p => {
        ctx.fillRect(p[0] * pixelSize, p[1] * pixelSize, pixelSize, pixelSize);
      });
    });

    ctx.fillStyle = 'green';
    newIncrement.pixels.forEach(p => {
      ctx.fillRect(p[0] * pixelSize, p[1] * pixelSize, pixelSize, pixelSize);
    });

    return canvas.toDataURL();
  }

  public async validateAccess(
    lobbyId: string,
    user?: UserInfo,
    inviteCode?: string
  ): Promise<PaintLobby> {
    const lobby = await this._dbService.lobbies.findOne({ id: lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id${lobbyId}`);
    }

    if (!inviteCode) {
      if (lobby.creatorEmail !== user?.email) {
        throw new Error('create increment without invite code or being creator');
      }
      if (lobby.increments.length > 0) {
        throw new Error('Creator token can only be used when no iterations have been added');
      }
      return lobby;
    }

    if (!lobby.inviteCodes.some(x => x === inviteCode)) {
      throw new Error('Invalid or used invite code');
    }
    return lobby;
  }

  private async validateNewIncrement(
    request: AddPixelsRequest,
    newIncrement: PaintIncrement,
    user?: UserInfo
  ) {
    const lobby = await this.validateAccess(request.lobbyId, user, request.inviteCode);

    if (!request.inviteCode) {
      newIncrement.confirmed = true;
    }

    if (lobby.increments.some(x => !x.confirmed)) {
      throw new Error('Cannot add new increment if unaccepted increment exists');
    }

    const pixelConflict = this.doesNewIncrementHavePixelConflict(request, lobby);
    if (pixelConflict) {
      throw new Error('Cannot add increment because some pixels are already occupied.');
    }

    if (lobby.creatorEmail !== user?.email && request.pixels.length > lobby.settings.maxPixels) {
      throw new Error(
        'Cannot add increment because it contains too many pixels and the iteration was not made by the creator'
      );
    }

    if (
      request.pixels.some(
        p => p.x < 0 || p.x >= lobby.settings.width || p.y < 0 || p.y >= lobby.settings.height
      )
    ) {
      throw new Error(
        'Cannot add increment because it contains pixels outside of the bounds of the lobby'
      );
    }
    return lobby;
  }

  private doesNewIncrementHavePixelConflict(request: AddPixelsRequest, lobby: PaintLobby) {
    return request.pixels.some(newPixel => {
      return lobby.increments.some(existingIncrement => {
        return existingIncrement.pixels.some(
          existingPixel => existingPixel[0] === newPixel.x && existingPixel[1] === newPixel.y
        );
      });
    });
  }

  async confirmIncrement(request: ConfirmIncrementRequest, user?: UserInfo): Promise<void> {
    if (!user) {
      throw new Error('Cannot create invite if not logged in');
    }

    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id ${request.lobbyId}`);
    }

    if (lobby.creatorEmail !== user.email) {
      throw new Error('Invalid creator token');
    }

    if (request.accept) {
      await this._dbService.lobbies.updateOne(
        { id: request.lobbyId, 'increments.confirmed': false },
        {
          $set: { 'increments.$.confirmed': true, 'increments.$.confirmCode': null },
        }
      );
    } else {
      await this._dbService.lobbies.updateOne(
        { id: request.lobbyId, 'increments.confirmed': false },
        {
          $pull: { increments: { confirmed: false } },
        }
      );
    }
  }

  async acceptInvite(lobbyId: string, code: string) {
    return this.acceptOrReject(lobbyId, code, true);
  }

  async rejectInvite(lobbyId: string, code: string) {
    return this.acceptOrReject(lobbyId, code, false);
  }

  private async acceptOrReject(lobbyId: string, code: string, accept: boolean) {
    const lobby = await this._dbService.lobbies.findOne({ id: lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id ${lobbyId}`);
    }
    const unconfirmedIncrement = lobby.increments.find(x => !x.confirmed);
    if (!unconfirmedIncrement) {
      throw new Error(`No unconfirmed increment in lobby ${lobbyId}`);
    }
    if (unconfirmedIncrement.confirmCode !== code) {
      throw new Error('Invalid confirm code');
    }
    if (accept) {
      await this._dbService.lobbies.updateOne(
        { id: lobbyId, 'increments.confirmed': false },
        {
          $set: { 'increments.$.confirmed': true, 'increments.$.confirmCode': null },
        }
      );
    } else {
      await this._dbService.lobbies.updateOne(
        { id: lobbyId, 'increments.confirmed': false },
        {
          $pull: { increments: { confirmed: false } },
        }
      );
    }
    return lobby;
  }

  public deleteIteration(lobbyId: string, incrementId: string) {
    return this._dbService.lobbies.updateOne(
      { id: lobbyId },
      {
        $pull: { increments: { id: incrementId } },
      }
    );
  }

  public changeIterationName(lobbyId: string, incrementId: string, name: string) {
    return this._dbService.lobbies.updateOne(
      { id: lobbyId, 'increments.id': incrementId },
      {
        $set: { 'increments.$.name': name },
      }
    );
  }

  public async changeIterationIndex(lobbyId: string, incrementId: string, index: number) {
    const lobby = await this._dbService.lobbies.findOne({ id: lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id ${lobbyId}`);
    }
    const increment = lobby.increments.find(x => x.id === incrementId);
    if (!increment) {
      throw new Error(`Cannot find increment with id ${incrementId}`);
    }
    // pull the increment from the array
    this._dbService.lobbies.updateOne(
      { id: lobbyId },
      {
        $pull: { increments: { id: incrementId } },
      }
    );
    // push the increment to the new index
    this._dbService.lobbies.updateOne(
      { id: lobbyId },
      {
        $push: { increments: { $each: [increment], $position: index } },
      }
    );
  }

  public async getLobbiesOfUser(user: UserInfo): Promise<LobbyPreviewResponse[]> {
    const lobbyIds = (
      await this._dbService.lobbies.find({ creatorEmail: user.email }).toArray()
    ).map(l => l.id);
    const lobbies = lobbyIds.map(l => this.getLobby(l, user));
    return (await Promise.all(lobbies)).map(l => ({
      id: l.id,
      name: l.name,
    }));
  }
}
