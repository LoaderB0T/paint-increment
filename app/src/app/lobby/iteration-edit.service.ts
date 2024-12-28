import { inject, Injectable } from '@angular/core';
import { LobbyResponse, WsService } from '@shared/api';
import { throwExp } from '@shared/utils';

@Injectable({ providedIn: 'root' })
export class IterationEditService {
  private readonly _wsService = inject(WsService);

  public deleteIteration(lobby: LobbyResponse, iterationId: string) {
    this._wsService.send('deleteIteration', { lobbyId: lobby.id, iterationId });
    const index = lobby.pixelIterations.findIndex(i => i.id === iterationId);
    if (index === -1) {
      throw new Error('Iteration not found');
    }
    lobby.pixelIterations.splice(index, 1);
  }
  public changeIterationName(lobby: LobbyResponse, iterationId: string, newName: string) {
    this._wsService.send('changeIterationName', { lobbyId: lobby.id, iterationId, newName });
    const iteration =
      lobby.pixelIterations.find(i => i.id === iterationId) ?? throwExp('Iteration not found');
    iteration.name = newName;
  }
  public changeIterationIndex(lobby: LobbyResponse, iterationId: string, newIndex: number) {
    this._wsService.send('changeIterationIndex', { lobbyId: lobby.id, iterationId, newIndex });
    const oldIndex = lobby.pixelIterations.findIndex(i => i.id === iterationId);
    if (oldIndex === -1) {
      throw new Error('Iteration not found');
    }
    const iteration = lobby.pixelIterations.splice(oldIndex, 1)[0];
    lobby.pixelIterations.splice(newIndex, 0, iteration);
  }

  public reservationTime() {
    return this._wsService.listen('reservationTime');
  }
}
