import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbService } from './data/db.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [DbService]
})
export class AppModule {}
