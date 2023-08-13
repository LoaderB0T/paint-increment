import { Controller, Get, Session, UseGuards } from '@nestjs/common';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { getUserById } from 'supertokens-node/recipe/thirdparty';
import { AuthGuard } from './auth.guard';
import { UserInfo } from './user-info.dto';

@Controller('auth')
export class AuthController {
  @Get('userinfo')
  @UseGuards(new AuthGuard())
  async getUserInfo(@Session() session: SessionContainer): Promise<UserInfo> {
    const userInfo = await getUserById(session.getUserId());
    if (!userInfo) {
      throw new Error('User not found');
    }
    return userInfo;
  }
}
