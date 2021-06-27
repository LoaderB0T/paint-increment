import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { AddPixelsRequest } from '../models/dtos/add-pixels-request.dto';
import { ConfirmIncrementRequest } from '../models/dtos/confirm-increment-request.dto';
import { CreateLobbyRequest } from '../models/dtos/create-lobby-request.dto';
import { LobbyResponse } from '../models/dtos/lobby-response.dto';
import { NewInviteCodeRequestDto } from '../models/dtos/new-invite-code-request.dto';
import { NewInviteCodeResponseDto } from '../models/dtos/new-invite-code-response.dto';
import { ValdiateInviteCodeRequestDto } from '../models/dtos/valdiate-invite-code-request.dto';
import { ValidateInviteCodeResponseDto } from '../models/dtos/valdiate-invite-code-response.dto';
import { PaintIncrement } from '../models/paint-increment.model';
import { PaintLobbySettings } from '../models/paint-lobby-settins.model';
import { PaintLobby } from '../models/paint-lobby.model';
import { DbService } from './db.service';

@Injectable()
export class LobbyService {
  private readonly _dbService: DbService;

  constructor(dbService: DbService) {
    this._dbService = dbService;
  }

  async createLobby(request: CreateLobbyRequest) {
    const settings: PaintLobbySettings = {
      height: request.settings?.height ?? 128,
      width: request.settings?.height ?? 128
    };

    const lobby: PaintLobby = {
      id: uuid(),
      name: request.name,
      increments: [],
      settings,
      creatorToken: uuid(),
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
      creatorToken: lobby.creatorToken,
      settings: lobby.settings
    };
    return res;
  }

  async generateInvite(request: NewInviteCodeRequestDto): Promise<NewInviteCodeResponseDto> {
    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id ${request.lobbyId}`);
    }
    if (lobby.creatorToken !== request.creatorToken) {
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

  async getLobby(lobbyId: string): Promise<LobbyResponse> {
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
          email: i.email,
          name: i.name,
          pixels: i.pixels.map(ip => {
            return { x: ip[0], y: ip[1] };
          })
        };
      }),
      settings: lobby.settings
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

    if (!request.inviteCode) {
      throw new Error('create increment without invite code');
    }

    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id${request.lobbyId}`);
    }

    if (!lobby.inviteCodes.some(x => x === request.inviteCode)) {
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
  }

  async confirmIncrement(request: ConfirmIncrementRequest): Promise<void> {
    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id${request.lobbyId}`);
    }

    if (lobby.creatorToken !== request.creatorToken) {
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
