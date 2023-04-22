import { Db, MongoClient } from 'mongodb';
import assert = require('assert');
import { Injectable } from '@nestjs/common';
import { PaintLobby } from '../models/paint-lobby.model';
import { ConfigService } from './config.service';

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
