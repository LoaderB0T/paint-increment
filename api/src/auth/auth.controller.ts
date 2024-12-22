import { Controller, Get, Session, UseGuards } from '@nestjs/common';
import { SessionContainer } from 'supertokens-node/recipe/session';

import { AuthGuard } from './auth.guard.js';
import { UserInfo } from './user-info.dto.js';
import { getUserInfo } from '../util/get-user-info.js';

@Controller('auth')
export class AuthController {
  @Get('userinfo')
  @UseGuards(new AuthGuard())
  async getUserInfo(@Session() session: SessionContainer): Promise<UserInfo> {
    const userInfo = await getUserInfo(session.getUserId());
    if (!userInfo) {
      throw new Error('User not found');
    }
    return userInfo;
  }
}
