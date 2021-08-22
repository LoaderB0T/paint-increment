// import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Socket, Server } from 'socket.io';
// import { WsState } from './models/ws-state.model';
// import { WsService } from './services/ws.service';

// @WebSocketGateway(Number.parseInt(process.env.WSPORT ?? '0') || 3001, { cors: true })
// export class MainGateway implements OnGatewayDisconnect {
//   @WebSocketServer() server!: Server;
//   private readonly _wsService: WsService;

//   constructor(wsService: WsService) {
//     this._wsService = wsService;
//     wsService.init(this.server);
//   }

//   @SubscribeMessage('lookAtLobby')
//   lookingAtLobby(client: Socket, data: { lobbyId: string }): void {
//     WsState.lockState[data.lobbyId] ??= { lookingAtLobby: [], lockedBy: null };
//     WsState.lockState[data.lobbyId].lookingAtLobby.push(client.id);
//     WsState.userState[client.id] ??= { lobbies: [] };
//     WsState.userState[client.id].lobbies.push(data.lobbyId);
//     client.emit('lobbyLocked', !!WsState.lockState[data.lobbyId].lockedBy);

//     console.log(WsState.userState);
//     console.log(WsState.lockState);
//   }

//   // TODO: Implement rooms
//   // https://socket.io/docs/v3/emit-cheatsheet/index.html

//   @SubscribeMessage('startPaint')
//   startPaint(client: Socket, data: { lobbyId: string }): void {
//     WsState.lockState[data.lobbyId] ??= { lookingAtLobby: [], lockedBy: null };
//     if (WsState.lockState[data.lobbyId].lockedBy) {
//       client.emit('startPaint', false);
//     }
//     WsState.lockState[data.lobbyId].lockedBy = client.id;
//     client.emit('startPaint', true);
//     client.broadcast.emit('lobbyLocked', true);
//   }

//   handleDisconnect(client: Socket) {
//     this._wsService.disconnect(client);

//   }
// }
