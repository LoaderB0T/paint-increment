import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsGateway } from './models/ws-gateway.model';
import { WsState } from './models/ws-state.model';
import { LobbyService } from './services/lobby.service';
import { WsService } from './services/ws.service';

@Injectable()
export class LobbyGateway implements WsGateway {
  private readonly _wsService: WsService;
  private readonly _lobbyService: LobbyService;

  constructor(wsService: WsService, lobbyService: LobbyService) {
    this._wsService = wsService;
    this._lobbyService = lobbyService;
    this._wsService.addGateway(this);
  }

  public addSocket(client: Socket, clientId: string): void {
    this._wsService.listen(client, 'lookAtLobby').subscribe(async data => {
      this._wsService.joinRoom(client, data.lobbyId);
      WsState.lockState[data.lobbyId] ??= { lookingAtLobby: [], lockedBy: null, lockedByName: null };
      const lockData = WsState.lockState[data.lobbyId];
      lockData.lookingAtLobby.push(data.uid);
      WsState.userState[data.uid] ??= { lobbies: [] };
      WsState.userState[data.uid].lobbies.push(data.lobbyId);

      const lobby = await this._lobbyService.getLobby(data.lobbyId, data.uid);
      if (lobby.pixelIterations.length === 0) {
        if (lobby.isCreator) {
          lockData.lockedBy = data.uid;
          this._wsService.sendToClient(clientId, 'lobbyReserved', { isReserved: true });
        } else {
          this._wsService.sendToClient(clientId, 'lobbyLocked', { isLocked: true });
        }
        return;
      }

      if (lockData.lockedBy === data.uid) {
        this._wsService.sendToClient(clientId, 'lobbyReserved', { isReserved: true });
      } else {
        this._wsService.sendToClient(clientId, 'lobbyLocked', {
          isLocked: !!lockData.lockedBy,
          lockedBy: lockData.lockedByName ?? undefined
        });
      }
    });

    this._wsService.listen(client, 'lockLobby').subscribe(data => {
      WsState.lockState[data.lobbyId] ??= { lookingAtLobby: [], lockedBy: null, lockedByName: null };
      const lockData = WsState.lockState[data.lobbyId];
      if (lockData.lockedBy) {
        this._wsService.sendToClient(clientId, 'lobbyReserved', { isReserved: false });
        return;
      }
      lockData.lockedBy = data.uid;
      lockData.lockedByName = data.name;
      lockData.timeoutTime = 15 * 60; // 15 minutes
      lockData.interval = setInterval(() => {
        if (lockData.timeoutTime === undefined) {
          WsState.deleteTimeout(lockData);
          return;
        }
        lockData.timeoutTime--;
        if (lockData.timeoutTime <= 0) {
          WsState.deleteTimeout(lockData);
          this._wsService.sendToRoom(clientId, data.lobbyId, 'lobbyLocked', { isLocked: false });
          this._wsService.sendToClient(clientId, 'lobbyReserved', { isReserved: false });
          lockData.lockedBy = null;
        } else {
          this._wsService.sendToClient(clientId, 'reservationTime', { timeLeft: lockData.timeoutTime });
        }
      }, 1000) as any as number;
      this._wsService.sendToClient(clientId, 'lobbyReserved', { isReserved: true });
      this._wsService.sendToRoom(clientId, data.lobbyId, 'lobbyLocked', { isLocked: true, lockedBy: data.name });
    });

    this._wsService.listen(client, 'unlockLobby').subscribe(async data => {
      WsState.lockState[data.lobbyId] ??= { lookingAtLobby: [], lockedBy: null, lockedByName: null };
      const lockData = WsState.lockState[data.lobbyId];
      if (lockData.lockedBy === data.uid || (await this._lobbyService.getLobby(data.lobbyId, data.uid)).isCreator) {
        WsState.deleteTimeout(lockData);
        lockData.interval = undefined;
        lockData.lockedBy = null;
        this._wsService.sendToRoom(clientId, data.lobbyId, 'lobbyLocked', { isLocked: false });
      }
    });
  }
}
