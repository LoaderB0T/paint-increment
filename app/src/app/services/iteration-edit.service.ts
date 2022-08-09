import { Injectable } from '@angular/core';
import { UserInfoService } from './user-info.service';
import { WsService } from './ws.service';

@Injectable({ providedIn: 'root' })
export class IterationEditService {
  private readonly _wsService: WsService;
  private readonly _userInfoService: UserInfoService;

  constructor(wsService: WsService, userInfoService: UserInfoService) {
    this._wsService = wsService;
    this._userInfoService = userInfoService;
  }

  public deleteIteration(lobbyId: string, index: number) {
    this._wsService.send('lookAtLobby', { lobbyId });
  }

  public reservationTime() {
    return this._wsService.listen('reservationTime');
  }
}
