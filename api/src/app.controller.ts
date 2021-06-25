import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DbService } from './data/db.service';

@Controller()
export class AppController {
  private readonly _appService: AppService;
  private readonly _dbService: DbService;

  constructor(appService: AppService, dbService: DbService) {
    this._appService = appService;
    this._dbService = dbService;
  }

  @Get()
  getHello(): string {
    return this._appService.getHello();
  }
}
