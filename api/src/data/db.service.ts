import { Db, MongoClient } from 'mongodb';
import assert = require('assert');
import { v4 as uuid } from 'uuid';

import { Injectable } from '@nestjs/common';
import { PaintLobbySettings } from '../models/paint-lobby-settins.model';
import { CreateLobbyRequest } from '../models/dtos/create-lobby-request.dto';
import { PaintLobby } from '../models/paint-lobby.model';
import { LobbyResponse } from '../models/dtos/lobby-response.dto';
import { AddPixelsRequest } from '../models/dtos/add-pixels-request.dto';
import { PaintIncrement } from '../models/paint-increment.model';
import { ConfirmIncrementRequest } from '../models/dtos/confirm-increment-request.dto';

@Injectable()
export class DbService {
  private _db!: Db;

  constructor() {
    const url = 'mongodb://localhost:27017';
    const dbName = 'paint-increment';
    const client = new MongoClient(url, { useUnifiedTopology: true });

    client.connect(err => {
      assert.strictEqual(null, err);
      console.log('MongoDb: Connected successfullys to server');

      this._db = client.db(dbName);
    });
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
    const collection = this._db.collection<PaintLobby>('lobbies');
    await collection.insertOne(lobby);
  }

  async getLobby(lobbyId: string): Promise<LobbyResponse> {
    const collection = this._db.collection<PaintLobby>('lobbies');
    const lobby = await collection.findOne({ id: lobbyId });
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
    const collection = this._db.collection<PaintLobby>('lobbies');

    const newIncrement: PaintIncrement = {
      name: request.name,
      email: request.email,
      pixels: request.pixels,
      confirmed: false,
      confirmCode: uuid()
    };

    const lobby = await collection.findOne({ id: request.lobbyId });
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

    await collection.updateOne(
      { id: request.lobbyId },
      {
        $push: { increments: newIncrement }
      }
    );
  }

  async confirmIncrement(request: ConfirmIncrementRequest): Promise<void> {
    const collection = this._db.collection<PaintLobby>('lobbies');
    const lobby = await collection.findOne({ id: request.lobbyId });
    if (!lobby) {
      throw new Error(`Cannot find lobby with id${request.lobbyId}`);
    }
    const increment = lobby.increments.find(x => x.confirmCode === request.confirmCode);
    if (!increment) {
      throw new Error(`Cannot find increment to confirm (invalid confirm code?)`);
    }

    if (request.accept) {
      await collection.updateOne(
        { id: request.lobbyId, 'increments.confirmCode': request.confirmCode },
        {
          $set: { 'increments.$.confirmed': true, 'increments.$.confirmCode': null }
        }
      );
    } else {
      await collection.updateOne(
        { id: request.lobbyId, 'increments.confirmCode': request.confirmCode },
        {
          $pull: { increments: { confirmCode: request.confirmCode } }
        }
      );
    }
  }
}
