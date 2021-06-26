import { Db, MongoClient } from 'mongodb';
import assert = require('assert');
import { v4 as uuid } from 'uuid';

import { Injectable } from '@nestjs/common';
import { PaintLobbySettings } from '../models/paint-lobby-settins.model';
import { CreateLobbyRequest } from '../models/dtos/create-lobby-request.dto';
import { PaintLobby } from '../models/paint-lobby.model';

@Injectable()
export class DbService {
  private _db!: Db;

  constructor() {
    const url = 'mongodb://localhost:27017';
    const dbName = 'paint-increment';
    const client = new MongoClient(url, { useUnifiedTopology: true });

    client.connect((err) => {
      assert.strictEqual(null, err);
      console.log('MongoDb: Connected successfullys to server');

      this._db = client.db(dbName);
    });
  }

  async createLobby(
    request: CreateLobbyRequest,
    settings?: PaintLobbySettings,
  ) {
    const lobby: PaintLobby = {
      id: uuid(),
      name: request.name,
      increments: [],
      settings,
    };
    const collection = this._db.collection<PaintLobby>('lobbies');
    await collection.insertOne(lobby);
  }

  async getLobby(lobbyId: string) {
    const collection = this._db.collection<PaintLobby>('lobbies');
    const lobby = await collection.findOne({ id: lobbyId });
    if (!lobby) {
      throw new Error('Cannot find lobby with id ' + lobbyId);
    }
    return lobby.name;
  }

  async addPixels(lobbyId: string, pixels: [number, number][]) {
    const collection = this._db.collection<PaintLobby>('lobbies');
    const lobby = await collection.findOne({ id: lobbyId });
    if (!lobby) {
      throw new Error('Cannot find lobby with id ' + lobbyId);
    }
    lobby.increments.push({
      name: '',
      email: '',
      pixels,
    });
  }
}
