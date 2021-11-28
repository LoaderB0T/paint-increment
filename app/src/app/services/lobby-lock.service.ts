import { Injectable } from '@angular/core';
import { UserInfoService } from './user-info.service';
import { WsService } from './ws.service';

@Injectable({ providedIn: 'root' })
export class LobbyLockService {
  private readonly _wsService: WsService;
  private readonly _userInfoService: UserInfoService;

  constructor(wsService: WsService, userInfoService: UserInfoService) {
    this._wsService = wsService;
    this._userInfoService = userInfoService;
  }

  public lock(lobbyId: string): void {
    this._wsService.send('lockLobby', { lobbyId, name: this._userInfoService.name });
  }

  public unlock(lobbyId: string) {
    this._wsService.send('unlockLobby', { lobbyId });
  }

  public lookingAtLobby(lobbyId: string) {
    this._wsService.send('lookAtLobby', { lobbyId });
  }

  public lobbyLocked() {
    return this._wsService.listen('lobbyLocked');
  }

  public lobbyReserved() {
    return this._wsService.listen('lobbyReserved');
  }

  public reservationTime() {
    return this._wsService.listen('reservationTime');
  }
}
