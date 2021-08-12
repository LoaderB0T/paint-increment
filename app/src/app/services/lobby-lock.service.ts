import { Injectable } from '@angular/core';
import { LockLobbyAction, LookingAtLobbyAction } from '../models/ws-events';
import { WsService } from './ws.service';

@Injectable({ providedIn: 'root' })
export class LobbyLockService {
  private readonly _wsService: WsService;

  constructor(wsService: WsService) {
    this._wsService = wsService;
  }

  public lock(lobbyId: string): void {
    this._wsService.send(new LockLobbyAction(lobbyId));
  }

  public lookingAtLobby(lobbyId: string) {
    this._wsService.send(new LookingAtLobbyAction(lobbyId));
  }
}
