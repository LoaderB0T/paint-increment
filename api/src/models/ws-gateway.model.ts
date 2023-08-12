import { Socket } from 'socket.io';
import Session from 'supertokens-node/recipe/session';
import { WsService } from '../services/ws.service';
import { UserInfo } from '../auth/user-info.dto';
import { getUserById } from 'supertokens-node/recipe/thirdparty';

export abstract class WsGateway {
  protected readonly _wsService: WsService;

  protected constructor(wsService: WsService) {
    this._wsService = wsService;
  }

  public abstract addSocket(socket: Socket, clientId: string): void;

  protected async getUid<T extends { authToken?: string; uid?: string }>(data: T): Promise<string> {
    if (!data.authToken && !data.uid) {
      throw new Error('No authToken or uid provided');
    }

    const res = data.authToken
      ? (await Session.getSessionWithoutRequestResponse(data.authToken)).getUserId()
      : data.uid;

    if (!res) {
      throw new Error('No uid found');
    }

    return res;
  }

  protected async tryGetUserInfo<T extends { authToken?: string; uid?: string }>(
    data: T
  ): Promise<UserInfo | undefined> {
    const uid = await this.getUid(data);

    const res = await getUserById(uid);

    return res
      ? {
          email: res.email,
          id: res.id,
        }
      : undefined;
  }

  protected async getUserInfo<T extends { authToken?: string; uid?: string }>(
    data: T
  ): Promise<UserInfo> {
    const res = await this.tryGetUserInfo(data);
    if (!res) {
      throw new Error('No user info found');
    }
    return res;
  }
}
