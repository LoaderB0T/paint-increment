import { Injectable } from '@nestjs/common';
import { createServer } from 'http';
import { Observable } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { ExtractPayload, WsCommunication, WsReceiveMessage, WsSendMessage } from '../models/ws-event-types.model';
import { WsGateway } from '../models/ws-gateway.model';
import { WsState } from '../models/ws-state.model';
import { ConfigService } from './config.service';

@Injectable()
export class WsService {
  private readonly _configService: ConfigService;
  private readonly _io: Server;
  private readonly _registeredGateways: WsGateway[] = [];

  constructor(configService: ConfigService) {
    this._configService = configService;

    const httpServer = createServer();
    this._io = new Server(httpServer, {
      cors: {
        origin: this._configService.config.origins
      }
    });

    this._io.engine.on('connection_error', (err: any) => {
      console.log(err.req); // the request object
      console.log(err.code); // the error code, for example 1
      console.log(err.message); // the error message, for example "Session ID unknown"
      console.log(err.context); // some additional error context
    });

    httpServer.listen(Number.parseInt(process.env.WSPORT ?? '0') || 3001);

    this._io.on('connection', (socket: Socket) => {
      this._registeredGateways.forEach(gateway => {
        gateway.addSocket(socket);
      });

      if (configService.config.debug) {
        socket.onAny((...data) => {
          console.log(data);
        });
        console.log('WS connected');
        socket.on('disconnect', () => {
          console.log('WS disconnected');
        });
      }
    });
  }

  public addGateway(gateway: WsGateway): void {
    this._registeredGateways.push(gateway);
  }

  private disconnect(client: Socket) {
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

  public sendToClient<T extends WsSendMessage>(socket: Socket, method: T, payload: ExtractPayload<WsCommunication, T>): void {
    socket.emit(method as string, payload);
  }

  public sendToRoom<T extends WsSendMessage>(
    socket: Socket,
    room: string,
    method: T,
    payload: ExtractPayload<WsCommunication, T>
  ): void {
    socket.to(room).emit(method as string, payload);
  }

  public joinRoom(socket: Socket, roomName: string): void {
    socket.join(roomName);
  }

  public leaveRoom(socket: Socket, roomName: string): void {
    socket.leave(roomName);
  }

  // public sendToRoom<T extends WsSendMessage>(method: T, payload: ExtractPayload<WsCommunication, T>): void {
  //   this._server.emit(method, payload);
  // }

  // public sendToAll<T extends WsSendMessage>(method: T, payload: ExtractPayload<WsCommunication, T>): void {
  //   this._server.emit(method, payload);
  // }

  public listen<T extends WsReceiveMessage>(socket: Socket, method: T): Observable<ExtractPayload<WsCommunication, T>> {
    return new Observable<ExtractPayload<WsCommunication, T>>(observer => {
      socket.on(method as string, (data: ExtractPayload<WsCommunication, T>) => {
        console.log(`WS listened: ${method}`, data);
        observer.next(data);
      });
    });
  }
}
