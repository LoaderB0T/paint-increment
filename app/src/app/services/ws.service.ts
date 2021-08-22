import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
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
  private readonly _listens: { [key: string]: any } = {};

  constructor(idService: IdService) {
    this._idService = idService;
    this._socket = io(environment.apiUrl, {
      transports: ['websocket']
    });

    this._socket.on('connect', () => {
      console.log('WS connected');
    });
  }

  public init() {}

  public close() {
    this._socket.close();
  }

  public send<T extends WsSendMessage>(method: T, payload: ExtractPayload<WsCommunication, T>): void {
    payload.uid = this._idService.id;
    this._socket.emit(method, payload);
    console.log(`WS sent: ${method}`, payload);
  }

  public listen<T extends WsReceiveMessage>(method: T): Observable<ExtractPayload<WsCommunication, T>> {
    const existingListener = this._listens[method];
    if (existingListener) {
      return existingListener;
    }
    const subject = new Subject<ExtractPayload<WsCommunication, T>>();
    this._socket.on(method as string, (data: ExtractPayload<WsCommunication, T>) => {
      console.log(`WS listened: ${method}`, data);
      subject.next(data);
    });
    const obs = subject.asObservable();
    this._listens[method] = obs;
    return obs;
  }
}
