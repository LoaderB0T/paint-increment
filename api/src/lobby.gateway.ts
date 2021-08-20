import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WsState } from './models/ws-state.model';

@WebSocketGateway(Number.parseInt(process.env.WSPORT ?? '0') || 3001, { cors: true })
export class LobbyGateway implements OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  @SubscribeMessage('lookAtLobby')
  lookingAtLobby(client: Socket, data: { lobbyId: string }): void {
    WsState.lockState[data.lobbyId] ??= { lookingAtLobby: [], lockedBy: null };
    WsState.lockState[data.lobbyId].lookingAtLobby.push(client.id);
    WsState.userState[client.id] ??= { lobbies: [] };
    WsState.userState[client.id].lobbies.push(data.lobbyId);
    client.emit('lobbyLocked', !!WsState.lockState[data.lobbyId].lockedBy);

    console.log(WsState.userState);
    console.log(WsState.lockState);
  }

  // TODO: Implement rooms
  // https://socket.io/docs/v3/emit-cheatsheet/index.html

  @SubscribeMessage('startPaint')
  startPaint(client: Socket, data: { lobbyId: string }): void {
    WsState.lockState[data.lobbyId] ??= { lookingAtLobby: [], lockedBy: null };
    if (WsState.lockState[data.lobbyId].lockedBy) {
      client.emit('startPaint', false);
    }
    WsState.lockState[data.lobbyId].lockedBy = client.id;
    client.emit('startPaint', true);
    client.broadcast.emit('lobbyLocked', true);
  }

  handleDisconnect(client: Socket) {
    if (!WsState.userState[client.id]) {
      return;
    }
    const lobbyNames = WsState.userState[client.id].lobbies;
    delete WsState.userState[client.id];
    for (const lobbyName of lobbyNames) {
      const index = WsState.lockState[lobbyName].lookingAtLobby.indexOf(client.id);
      if (index > -1) {
        WsState.lockState[lobbyName].lookingAtLobby.splice(index, 1);
      }
    }
  }
}
