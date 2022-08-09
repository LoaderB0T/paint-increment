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

  public deleteIteration(lobbyId: string, iterationId: string) {
    this._wsService.send('deleteIteration', { lobbyId, iterationId });
  }
  public changeIterationName(lobbyId: string, iterationId: string, newName: string) {
    this._wsService.send('changeIterationName', { lobbyId, iterationId, newName });
  }
  public changeIterationIndex(lobbyId: string, iterationId: string, newIndex: number) {
    this._wsService.send('changeIterationIndex', { lobbyId, iterationId, newIndex });
  }

  public reservationTime() {
    return this._wsService.listen('reservationTime');
  }
}
