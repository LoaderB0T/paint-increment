import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { AddPixelsRequest } from '../models/dtos/add-pixels-request.dto';
import { ConfirmIncrementRequest } from '../models/dtos/confirm-increment-request.dto';
import { CreateLobbyRequest } from '../models/dtos/create-lobby-request.dto';
import { LobbyResponse } from '../models/dtos/lobby-response.dto';
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
      settings
    };
    await this._dbService.lobbies.insertOne(lobby);
  }

  async getLobby(lobbyId: string): Promise<LobbyResponse> {
    const lobby = await this._dbService.lobbies.findOne({ id: lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id ${lobbyId}`);
    }
    const res: LobbyResponse = {
      name: lobby.name,
      pixels: lobby.increments.map(x => x.pixels).flat()
    };
    return res;
  }

  async addIncrement(request: AddPixelsRequest) {
    const newIncrement: PaintIncrement = {
      name: request.name,
      email: request.email,
      pixels: request.pixels,
      confirmed: false,
      confirmCode: uuid()
    };

    const lobby = await this._dbService.lobbies.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id${request.lobbyId}`);
    }

    if (lobby.increments.some(x => !x.confirmed)) {
      throw new Error('Cannot add new increment if unaccepted increment exists');
    }

    const pixelConflict = request.pixels.some(newPixel => {
      return lobby.increments.some(existingIncrement => {
        return existingIncrement.pixels.some(
          existingPixel => existingPixel[0] === newPixel[0] && existingPixel[1] === newPixel[1]
        );
      });
    });
    if (pixelConflict) {
      throw new Error('Cannot add increment because some pixels are already occupied.');
    }

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
    const increment = lobby.increments.find(x => x.confirmCode === request.confirmCode);
    if (!increment) {
      throw new Error(`Cannot find increment to confirm (invalid confirm code?)`);
    }

    if (request.accept) {
      await this._dbService.lobbies.updateOne(
        { id: request.lobbyId, 'increments.confirmCode': request.confirmCode },
        {
          $set: { 'increments.$.confirmed': true, 'increments.$.confirmCode': null }
        }
      );
    } else {
      await this._dbService.lobbies.updateOne(
        { id: request.lobbyId, 'increments.confirmCode': request.confirmCode },
        {
          $pull: { increments: { confirmCode: request.confirmCode } }
        }
      );
    }
  }
}
