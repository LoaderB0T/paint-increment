import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { ExtractPayload, WsCommunication, WsReceiveMessage, WsSendMessage } from '../models/ws-event-types.model';
import { IdService } from './id.service';

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private readonly _socket: Socket;
  private readonly _idService: IdService;

  constructor(idService: IdService) {
    this._idService = idService;
    this._socket = io(environment.wsUrl);

    this._socket.on('connect', () => {
      console.log('WS connected');
    });
  }

  public init() {
    this._socket.onAny((name: string, data: any) => {
      console.log(`WS ${name}`, data);
    });
  }

  public send<T extends WsSendMessage>(method: T, payload: ExtractPayload<WsCommunication, T>): void {
    payload.uid = this._idService.id;
    this._socket.emit(method, payload);
    console.log(`WS sent: ${method}`, payload);
  }

  public listen<T extends WsReceiveMessage>(method: T): Observable<ExtractPayload<WsCommunication, T>> {
    return new Observable<ExtractPayload<WsCommunication, T>>(observer => {
      this._socket.on(method as string, (data: ExtractPayload<WsCommunication, T>) => {
        console.log(`WS listened: ${method}`, data);
        observer.next(data);
      });
    });
  }
}
