import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsGateway } from '../models/ws-gateway.model';
import { WsState } from '../models/ws-state.model';
import { WsService } from './ws.service';

@Injectable()
export class LobbyWsService implements WsGateway {
  private readonly _wsService: WsService;

  constructor(wsService: WsService) {
    this._wsService = wsService;
    this._wsService.addGateway(this);
  }

  public addSocket(client: Socket): void {
    this._wsService.listen(client, 'lookAtLobby').subscribe(data => {
      this._wsService.joinRoom(client, data.lobbyId);
      WsState.lockState[data.lobbyId] ??= { lookingAtLobby: [], lockedBy: null };
      WsState.lockState[data.lobbyId].lookingAtLobby.push(client.id);
      WsState.userState[client.id] ??= { lobbies: [] };
      WsState.userState[client.id].lobbies.push(data.lobbyId);
      client.emit('lobbyLocked', !!WsState.lockState[data.lobbyId].lockedBy);
    });

    this._wsService.listen(client, 'lockLobby').subscribe(data => {
      WsState.lockState[data.lobbyId] ??= { lookingAtLobby: [], lockedBy: null };
      if (WsState.lockState[data.lobbyId].lockedBy) {
        this._wsService.sendToClient(client, 'lobbyReserved', { isReserved: false });
      }
      WsState.lockState[data.lobbyId].lockedBy = client.id;
      this._wsService.sendToClient(client, 'lobbyReserved', { isReserved: true });
      this._wsService.sendToRoom(client, data.lobbyId, 'lobbyReserved', { isReserved: true });
    });
  }
}
