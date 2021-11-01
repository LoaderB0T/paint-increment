import { Injectable } from '@angular/core';
import { WsService } from './ws.service';

@Injectable({ providedIn: 'root' })
export class LobbyLockService {
  private readonly _wsService: WsService;

  constructor(wsService: WsService) {
    this._wsService = wsService;
  }

  public lock(lobbyId: string): void {
    this._wsService.send('lockLobby', { lobbyId });
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
