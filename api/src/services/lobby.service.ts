import { Injectable } from '@nestjs/common';
import { createCanvas } from 'canvas';
import { v4 as uuid } from 'uuid';

import { AddPixelsRequest } from '../models/dtos/add-pixels-request.dto';
import { ConfirmIncrementRequest } from '../models/dtos/confirm-increment-request.dto';
import { CreateLobbyRequest } from '../models/dtos/create-lobby-request.dto';
import { LobbyNameAvailableRequestDto } from '../models/dtos/lobby-name-available-request.dto';
import { LobbyResponse } from '../models/dtos/lobby-response.dto';
import { NewInviteCodeRequestDto } from '../models/dtos/new-invite-code-request.dto';
import { NewInviteCodeResponseDto } from '../models/dtos/new-invite-code-response.dto';
import { ValidateInviteCodeRequestDto } from '../models/dtos/validate-invite-code-request.dto';
import { ValidateInviteCodeResponseDto } from '../models/dtos/validate-invite-code-response.dto';
import { PaintIncrement } from '../models/paint-increment.model';
import { PaintLobbySettings } from '../models/paint-lobby-settings.model';
import { PaintLobby } from '../models/paint-lobby.model';
import { WsState } from '../models/ws-state.model';
import { ConfigService } from './config.service';
import { DbService } from './db.service';
import { MailService } from './mail.service';

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

  async createLobby(request: CreateLobbyRequest) {
    const settings: PaintLobbySettings = {
      height: request.settings.height ?? 128,
      width: request.settings.height ?? 128,
      maxPixels: request.settings.maxPixels,
      timeLimit: request.settings.timeLimit ?? 15
    };

    if (!settings.maxPixels || settings.maxPixels < 1) {
      throw new Error('Max pixels must be greater than 0');
    }

    const lobby: PaintLobby = {
      id: uuid(),
      name: request.name,
      increments: [],
      settings,
      creatorUids: [request.uid],
      creatorSecret: uuid(),
      creatorEmail: request.email,
      creatorName: request.ownerName,
      inviteCodes: []
    };

    if (await this._dbService.lobbies.findOne({ name: request.name })) {
      throw new Error('Lobby name already in use');
    }

    await this._dbService.lobbies.insertOne(lobby);

    const url = this._configService.config.clientAddress;
    const lobbyUrl = `${url}/lobby/${lobby.id}`;
    const creatorUrl = `${lobbyUrl}?creatorCode=${lobby.creatorSecret}`;

    const html = `
    <h1>paint.awdware.de</h1>
    <h2>Hi, ${request.ownerName}. You just successfully created the lobby '${lobby.name}'.</h2>
    
    <p>
      You can view the lobby with the following link:
      <a href="${lobbyUrl}">Lobby link</a>
    </p>
    <p>
      You can gain creator rights on a different device by using the link below. Don't share this link with anyone else.
      <a href="${creatorUrl}">Creator Link</a>
    </p>

    `;

    this._mailService.sendMail(lobby.creatorEmail, 'Lobby created - paint.awdware.de', html);

    const res: LobbyResponse = {
      id: lobby.id,
      name: lobby.name,
      pixelIterations: [],
      settings: lobby.settings,
      isCreator: true
    };
    return res;
  }

  async lobbyNameAvailable(request: LobbyNameAvailableRequestDto): Promise<boolean> {
    return !(await this._dbService.lobbies.findOne({ name: request.name }));
  }

  async generateInvite(request: NewInviteCodeRequestDto): Promise<NewInviteCodeResponseDto> {
    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id ${request.lobbyId}`);
    }
    if (!lobby.creatorUids.includes(request.uid)) {
      throw new Error('Invalid creator token');
    }
    const newCode = uuid();

    await this._dbService.lobbies.updateOne(
      { id: request.lobbyId },
      {
        $push: { inviteCodes: newCode }
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

  async getLobby(lobbyId: string, uid: string): Promise<LobbyResponse> {
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
          pixels: i.pixels.map(ip => {
            return { x: ip[0], y: ip[1] };
          })
        };
      }),
      settings: lobby.settings,
      isCreator: lobby.creatorUids.includes(uid)
    };
    return res;
  }

  public async invalidateInvite(lobbyId: string, code: string) {
    await this._dbService.lobbies.updateOne(
      { id: lobbyId },
      {
        $pull: { inviteCodes: code }
      }
    );
  }

  public async addIncrement(request: AddPixelsRequest) {
    const newIncrement: PaintIncrement = {
      name: request.name,
      email: request.email,
      pixels: request.pixels.map(p => [p.x, p.y]),
      confirmed: false,
      confirmCode: uuid()
    };

    const lobby = await this.validateNewIncrement(request, newIncrement);

    if (request.inviteCode) {
      await this.invalidateInvite(lobby.id, request.inviteCode);
    }

    await this._dbService.lobbies.updateOne(
      { id: request.lobbyId },
      {
        $push: { increments: newIncrement }
      }
    );

    const lockData = WsState.lockState[request.lobbyId];
    WsState.deleteTimeout(lockData);

    const imgData = this.getImageDataForNewIncrement(lobby, newIncrement);
    const url = this._configService.config.ownAddress;
    const acceptUrl = `${url}/lobby/accept/${request.lobbyId}/${newIncrement.confirmCode}`;
    const rejectUrl = `${url}/lobby/reject/${request.lobbyId}/${newIncrement.confirmCode}`;

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

  public async validateAccess(lobbyId: string, uid?: string, inviteCode?: string): Promise<PaintLobby> {
    if (!uid) {
      throw new Error('No uid provided');
    }

    const lobby = await this._dbService.lobbies.findOne({ id: lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id${lobbyId}`);
    }

    if (!inviteCode) {
      if (!lobby.creatorUids.includes(uid)) {
        throw new Error('create increment without invite code or valid creator token');
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

  private async validateNewIncrement(request: AddPixelsRequest, newIncrement: PaintIncrement) {
    const lobby = await this.validateAccess(request.lobbyId, request.uid, request.inviteCode);

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

    if (!lobby.creatorUids.includes(request.uid ?? '-') && request.pixels.length > lobby.settings.maxPixels) {
      throw new Error('Cannot add increment because it contains too many pixels and the iteration was not made by the creator');
    }

    if (request.pixels.some(p => p.x < 0 || p.x >= lobby.settings.width || p.y < 0 || p.y >= lobby.settings.height)) {
      throw new Error('Cannot add increment because it contains pixels outside of the bounds of the lobby');
    }
    return lobby;
  }

  private doesNewIncrementHavePixelConflict(request: AddPixelsRequest, lobby: PaintLobby) {
    return request.pixels.some(newPixel => {
      return lobby.increments.some(existingIncrement => {
        return existingIncrement.pixels.some(existingPixel => existingPixel[0] === newPixel.x && existingPixel[1] === newPixel.y);
      });
    });
  }

  async confirmIncrement(request: ConfirmIncrementRequest): Promise<void> {
    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id ${request.lobbyId}`);
    }

    if (!lobby.creatorUids.includes(request.uid)) {
      throw new Error('Invalid creator token');
    }

    if (request.accept) {
      await this._dbService.lobbies.updateOne(
        { id: request.lobbyId, 'increments.confirmed': false },
        {
          $set: { 'increments.$.confirmed': true, 'increments.$.confirmCode': null }
        }
      );
    } else {
      await this._dbService.lobbies.updateOne(
        { id: request.lobbyId, 'increments.confirmed': false },
        {
          $pull: { increments: { confirmed: false } }
        }
      );
    }
  }

  async acceptInvite(lobbyId: string, code: string) {
    this.acceptOrReject(lobbyId, code, true);
  }

  async rejectInvite(lobbyId: string, code: string) {
    this.acceptOrReject(lobbyId, code, false);
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
          $set: { 'increments.$.confirmed': true, 'increments.$.confirmCode': null }
        }
      );
    } else {
      await this._dbService.lobbies.updateOne(
        { id: lobbyId, 'increments.confirmed': false },
        {
          $pull: { increments: { confirmed: false } }
        }
      );
    }
  }
}
