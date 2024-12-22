import { readFileSync } from 'fs';

import { Injectable } from '@nestjs/common';

import { Config } from '../models/config.model.js';

@Injectable()
export class ConfigService {
  public readonly config: Config;

  constructor() {
    this.config = JSON.parse(readFileSync('config.json', 'utf8')) as Config;
    if (process.env.MONGODB_URI) {
      this.config.db.address = process.env.MONGODB_URI;
    }
  }
}
