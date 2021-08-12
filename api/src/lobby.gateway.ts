import { OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WsState } from './models/ws-state.model';

@WebSocketGateway(Number.parseInt(process.env.WSPORT ?? '0') || 3001, { cors: true })
export class LobbyGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  @SubscribeMessage('lookingAtLobby')
  lookingAtLobby(client: Socket, lobbyId: string): void {
    WsState.lockState[lobbyId] ??= { lookingAtLobby: [], lockedBy: null };
    WsState.lockState[lobbyId].lookingAtLobby.push(client.id);
    WsState.userState[client.id] ??= { lobbies: [] };
    WsState.userState[client.id].lobbies.push(lobbyId);
  }

  afterInit(server: Server) {
    console.log(server);
  }

  handleDisconnect(client: Socket) {
    console.log(WsState.userState);
    console.log(WsState.lockState);
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
    console.log(WsState.userState);
    console.log(WsState.lockState);
  }
}
