import { Db, MongoClient } from 'mongodb';
import assert = require('assert');
import { Injectable } from '@nestjs/common';
import { PaintLobby } from '../models/paint-lobby.model';

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

  public get lobbies() {
    return this._db.collection<PaintLobby>('lobbies');
  }
}
