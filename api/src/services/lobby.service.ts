import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { AddPixelsRequest } from '../models/dtos/add-pixels-request.dto';
import { ConfirmIncrementRequest } from '../models/dtos/confirm-increment-request.dto';
import { CreateLobbyRequest } from '../models/dtos/create-lobby-request.dto';
import { LobbyNameAvailableRequestDto } from '../models/dtos/lobby-name-available-request.dto';
import { LobbyResponse } from '../models/dtos/lobby-response.dto';
import { NewInviteCodeRequestDto } from '../models/dtos/new-invite-code-request.dto';
import { NewInviteCodeResponseDto } from '../models/dtos/new-invite-code-response.dto';
import { ValdiateInviteCodeRequestDto } from '../models/dtos/valdiate-invite-code-request.dto';
import { ValidateInviteCodeResponseDto } from '../models/dtos/valdiate-invite-code-response.dto';
import { PaintIncrement } from '../models/paint-increment.model';
import { PaintLobbySettings } from '../models/paint-lobby-settings.model';
import { PaintLobby } from '../models/paint-lobby.model';
import { WsState } from '../models/ws-state.model';
import { DbService } from './db.service';
import { MailService } from './mail.service';

@Injectable()
export class LobbyService {
  private readonly _dbService: DbService;
  private readonly _mailService: MailService;

  constructor(dbService: DbService, mailService: MailService) {
    this._dbService = dbService;
    this._mailService = mailService;
  }

  async createLobby(request: CreateLobbyRequest) {
    const settings: PaintLobbySettings = {
      height: request.settings.height ?? 128,
      width: request.settings.height ?? 128,
      maxPixels: request.settings.maxPixels
    };

    if (!settings.maxPixels || settings.maxPixels < 1) {
      throw new Error('Max pixels must be greater than 0');
    }

    const lobby: PaintLobby = {
      id: uuid(),
      name: request.name,
      increments: [],
      settings,
      creatorUid: request.uid,
      creatorEmail: request.email,
      inviteCodes: []
    };

    if (await this._dbService.lobbies.findOne({ name: request.name })) {
      throw new Error('Lobby name already in use');
    }

    await this._dbService.lobbies.insertOne(lobby);

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
    if (lobby.creatorUid !== request.uid) {
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

  async inviteValid(request: ValdiateInviteCodeRequestDto): Promise<ValidateInviteCodeResponseDto> {
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
      isCreator: uid === lobby.creatorUid
    };
    return res;
  }

  async addIncrement(request: AddPixelsRequest) {
    const newIncrement: PaintIncrement = {
      name: request.name,
      email: request.email,
      pixels: request.pixels.map(p => [p.x, p.y]),
      confirmed: false
    };

    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id${request.lobbyId}`);
    }

    if (!request.inviteCode && request.uid !== lobby.creatorUid) {
      throw new Error('create increment without invite code or valid creator token');
    }

    if (!request.inviteCode && request.uid) {
      if (lobby.increments.length > 0) {
        throw new Error('Creator token can only be used when no iterations have been added');
      } else {
        newIncrement.confirmed = true;
      }
    }

    if (!newIncrement.confirmed && !lobby.inviteCodes.some(x => x === request.inviteCode)) {
      throw new Error('Invalid or used invite code');
    }

    if (lobby.increments.some(x => !x.confirmed)) {
      throw new Error('Cannot add new increment if unaccepted increment exists');
    }

    const pixelConflict = request.pixels.some(newPixel => {
      return lobby.increments.some(existingIncrement => {
        return existingIncrement.pixels.some(existingPixel => existingPixel[0] === newPixel.x && existingPixel[1] === newPixel.y);
      });
    });
    if (pixelConflict) {
      throw new Error('Cannot add increment because some pixels are already occupied.');
    }

    if (request.pixels.length > lobby.settings.maxPixels) {
      throw new Error('Cannot add increment because it contains too many pixels');
    }

    if (request.pixels.some(p => p.x < 0 || p.x >= lobby.settings.width || p.y < 0 || p.y >= lobby.settings.height)) {
      throw new Error('Cannot add increment because it contains pixels outside of the bounds of the lobby');
    }

    await this._dbService.lobbies.updateOne(
      { id: request.lobbyId },
      {
        $pull: { inviteCodes: request.inviteCode }
      }
    );

    await this._dbService.lobbies.updateOne(
      { id: request.lobbyId },
      {
        $push: { increments: newIncrement }
      }
    );

    const lockData = WsState.lockState[request.lobbyId];
    WsState.deleteTimeout(lockData);

    this._mailService.sendMail(
      lobby.creatorEmail,
      'New iteration added to lobby',
      `${request.name} has added a new iteration to ${lobby.name}`
    );
  }

  async confirmIncrement(request: ConfirmIncrementRequest): Promise<void> {
    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id${request.lobbyId}`);
    }

    if (lobby.creatorUid !== request.uid) {
      throw new Error('Invalid creator token');
    }

    if (request.accept) {
      await this._dbService.lobbies.updateOne(
        { id: request.lobbyId, 'increments.confirmed': false },
        {
          $set: { 'increments.$.confirmed': true }
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
}
