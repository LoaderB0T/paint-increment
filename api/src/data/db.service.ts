import { MongoClient } from 'mongodb';
import assert = require('assert');

import { Injectable } from '@nestjs/common';

@Injectable()
export class DbService {
  constructor() {
    const url = 'mongodb://localhost:27017';
    const dbName = 'paint-increment';
    const client = new MongoClient(url, { useUnifiedTopology: true });

    client.connect(function (err) {
      assert.strictEqual(null, err);
      console.log('MongoDb: Connected successfullys to server');

      const db = client.db(dbName);

      client.close();
    });
  }

  getHello(): string {
    return 'Hello World!';
  }
}
