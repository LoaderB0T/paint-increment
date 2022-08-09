import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsGateway } from './models/ws-gateway.model';
import { LobbyService } from './services/lobby.service';
import { WsService } from './services/ws.service';

@Injectable()
export class IterationEditGateway implements WsGateway {
  private readonly _wsService: WsService;
  private readonly _lobbyService: LobbyService;

  constructor(wsService: WsService, lobbyService: LobbyService) {
    this._wsService = wsService;
    this._lobbyService = lobbyService;
    this._wsService.addGateway(this);
  }

  public addSocket(client: Socket): void {
    this._wsService.listen(client, 'deleteIteration').subscribe(async data => {
      const lobby = await this._lobbyService.getLobby(data.lobbyId, data.uid);
      const iteration = lobby.pixelIterations.find(i => i.id === data.iterationId);
      if (!iteration) {
        throw new Error('Iteration not found');
      }
      this._lobbyService.deleteIteration(lobby.id, iteration.id);
    });

    this._wsService.listen(client, 'changeIterationName').subscribe(async data => {
      const lobby = await this._lobbyService.getLobby(data.lobbyId, data.uid);
      const iteration = lobby.pixelIterations.find(i => i.id === data.iterationId);
      if (!iteration) {
        throw new Error('Iteration not found');
      }
      this._lobbyService.changeIterationName(lobby.id, iteration.id, data.newName);
    });

    this._wsService.listen(client, 'changeIterationIndex').subscribe(async data => {
      const lobby = await this._lobbyService.getLobby(data.lobbyId, data.uid);
      const iteration = lobby.pixelIterations.find(i => i.id === data.iterationId);
      if (!iteration) {
        throw new Error('Iteration not found');
      }
      this._lobbyService.changeIterationIndex(lobby.id, iteration.id, data.newIndex);
    });
  }
}
