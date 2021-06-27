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
    const client = new MongoClient(dbAddress, { useUnifiedTopology: true });

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
