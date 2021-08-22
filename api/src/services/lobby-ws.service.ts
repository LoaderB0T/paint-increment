import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsGateway } from '../models/ws-gateway.model';
import { WsState } from '../models/ws-state.model';
import { LobbyService } from './lobby.service';
import { WsService } from './ws.service';

@Injectable()
export class LobbyWsService implements WsGateway {
  private readonly _wsService: WsService;
  private readonly _lobbyService: LobbyService;

  constructor(wsService: WsService, lobbyService: LobbyService) {
    this._wsService = wsService;
    this._lobbyService = lobbyService;
    this._wsService.addGateway(this);
  }

  public addSocket(client: Socket): void {
    this._wsService.listen(client, 'lookAtLobby').subscribe(async data => {
      this._wsService.joinRoom(client, data.lobbyId);
      WsState.lockState[data.lobbyId] ??= { lookingAtLobby: [], lockedBy: null };
      WsState.lockState[data.lobbyId].lookingAtLobby.push(client.id);
      WsState.userState[client.id] ??= { lobbies: [] };
      WsState.userState[client.id].lobbies.push(data.lobbyId);

      const lobby = await this._lobbyService.getLobby(data.lobbyId, data.uid);
      if (lobby.pixelIterations.length === 0) {
        if (lobby.isCreator) {
          this._wsService.sendToClient(client, 'lobbyReserved', { isReserved: true });
        } else {
          this._wsService.sendToClient(client, 'lobbyLocked', { isLocked: true });
        }
        return;
      }

      if (WsState.lockState[data.lobbyId].lockedBy === client.id) {
        this._wsService.sendToClient(client, 'lobbyReserved', { isReserved: true });
      } else {
        this._wsService.sendToClient(client, 'lobbyLocked', { isLocked: !!WsState.lockState[data.lobbyId].lockedBy });
      }
    });

    this._wsService.listen(client, 'lockLobby').subscribe(data => {
      WsState.lockState[data.lobbyId] ??= { lookingAtLobby: [], lockedBy: null };
      if (WsState.lockState[data.lobbyId].lockedBy) {
        this._wsService.sendToClient(client, 'lobbyReserved', { isReserved: false });
        return;
      }
      WsState.lockState[data.lobbyId].lockedBy = client.id;
      this._wsService.sendToClient(client, 'lobbyReserved', { isReserved: true });
      this._wsService.sendToRoom(client, data.lobbyId, 'lobbyLocked', { isLocked: true });
    });
  }
}
