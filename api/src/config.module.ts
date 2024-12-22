import { Module } from '@nestjs/common';

import { ConfigService } from './services/config.service.js';

@Module({
  imports: [],
  controllers: [],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
