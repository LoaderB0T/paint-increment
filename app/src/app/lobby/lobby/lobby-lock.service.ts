import { Injectable } from '@angular/core';
import { WsService } from '@shared/api';
import { UserInfoService } from '@shared/shared/user-info';

@Injectable({ providedIn: 'root' })
export class LobbyLockService {
  private readonly _wsService: WsService;
  private readonly _userInfoService: UserInfoService;

  constructor(wsService: WsService, userInfoService: UserInfoService) {
    this._wsService = wsService;
    this._userInfoService = userInfoService;
  }

  public lock(lobbyId: string, inviteCode: string): void {
    this._wsService.send('lockLobby', { lobbyId, name: this._userInfoService.name, inviteCode });
  }

  public discardDrawing(lobbyId: string): void {
    this._wsService.send('discardDrawing', { lobbyId });
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
