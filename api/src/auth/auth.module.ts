import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthMiddleware } from './auth.middleware.js';
import { SupertokensService } from './auth.service.js';
import { ConfigModule } from '../config.module.js';

@Module({
  imports: [ConfigModule],
  providers: [SupertokensService],
  exports: [],
  controllers: [],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
