import assert from 'assert';

import { Injectable } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';

import { ConfigService } from './config.service.js';
import { PaintLobby } from '../models/paint-lobby.model.js';

@Injectable()
export class DbService {
  private _db!: Db;

  constructor(configService: ConfigService) {
    const dbAddress = configService.config.db.address;
    const dbName = configService.config.db.database;
    const client = new MongoClient(dbAddress);

    client
      .connect()
      .then(() => {
        console.log(`MongoDb: Connected successfully to server: ${dbAddress}`);

        this._db = client.db(dbName);
      })
      .catch(err => {
        console.error(`MongoDb: Error connecting to server: ${dbAddress}`);
        assert.strictEqual(undefined, err);
      });
  }

  public get lobbies() {
    return this._db.collection<PaintLobby>('lobbies');
  }
}
