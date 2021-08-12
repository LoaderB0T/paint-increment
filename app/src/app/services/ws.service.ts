import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { WsAction, WsEvent } from '../models/ws-events';

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private readonly _socket: Socket;

  constructor() {
    this._socket = io(environment.wsUrl);

    this._socket.on('connect', () => {
      console.log('WS connected');
    });
  }

  public init() {}

  public send<T>(data: WsAction<T>) {
    this._socket.emit(data.endpoint, data.payload);
  }

  public listen<T>(event: WsEvent<T>) {
    return new Observable<T>(observer => {
      this._socket.on(event.endpoint, (data: T) => {
        observer.next(data);
      });
    });
  }
}
