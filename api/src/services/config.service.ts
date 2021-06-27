import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { Config } from '../models/config.model';

@Injectable()
export class ConfigService {
  public readonly config: Config;

  constructor() {
    this.config = JSON.parse(readFileSync('config.json', 'utf8')) as Config;
  }
}
