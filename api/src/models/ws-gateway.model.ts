import { Socket } from 'socket.io';

export interface WsGateway {
  addSocket(socket: Socket, clientId: string): void;
}
