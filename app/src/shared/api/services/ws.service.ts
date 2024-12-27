import { inject, Injectable } from '@angular/core';
import { AuthService } from '@shared/api';
import { environment } from '@shared/env';
import { assertBody, isBrowser } from '@shared/utils';
import { Observable, of, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import Session from 'supertokens-web-js/recipe/session';

import { IdService } from './id.service';
import { ExtractPayload, WsCommunication, WsReceiveMessage, WsSendMessage } from '../ws';

@Injectable({
  providedIn: 'root',
})
export class WsService {
  private readonly _idService = inject(IdService);
  private readonly _authService = inject(AuthService);
  private readonly _isBrowser = isBrowser();
  private _token?: string;
  private __socket?: Socket;
  private readonly _listens: { [key: string]: any } = {};
  private _lastRetryTime: number = 0;

  private get _socket(): Socket {
    if (!this.__socket) {
      throw new Error('Socket is not initialized');
    }
    return this.__socket;
  }

  public async init() {
    if (!this._isBrowser) {
      return;
    }
    const authObj = {
      uid: await this._idService.id(),
      accessToken: await this.getTokenFromAPI(),
    };
    this.__socket = io(environment.apiUrl, {
      transports: ['websocket'],
      auth: authObj,
    });

    this.listen('401').subscribe(async () => {
      const token = await this.getTokenFromAPI();

      this._socket.auth = {
        uid: await this._idService.id(),
        accessToken: token,
      };
      this._socket.connect();
    });

    this._socket.on('connect', () => {
      if (!environment.production) {
        console.log('WS connected');
      }
    });
  }

  public close() {
    this._socket.close();
  }

  public async send<T extends WsSendMessage>(
    method: T,
    payload: ExtractPayload<WsCommunication, T>
  ): Promise<void> {
    if (!this._isBrowser) {
      return;
    }
    payload.authToken = this._token;
    payload.uid = await this._idService.id();
    this._socket.emit(method, payload);
    if (!environment.production) {
      console.log(`WS sent: ${method}`, payload);
    }
  }

  public listen<T extends WsReceiveMessage>(
    method: T
  ): Observable<ExtractPayload<WsCommunication, T>> {
    if (!this._isBrowser) {
      return of();
    }
    const existingListener = this._listens[method];
    if (existingListener) {
      return existingListener;
    }
    const subject = new Subject<ExtractPayload<WsCommunication, T>>();
    this._socket.on(method as string, (data: ExtractPayload<WsCommunication, T>) => {
      if (!environment.production) {
        console.log(`WS listened: ${method}`, data);
      }
      subject.next(data);
    });
    const obs = subject.asObservable();
    this._listens[method] = obs;
    return obs;
  }

  private async getTokenFromAPI() {
    const success = await Session.attemptRefreshingSession();
    console.log('attemptRefreshingSession', success);
    if (this._lastRetryTime && Date.now() - this._lastRetryTime > 1000 * 60) {
      this._lastRetryTime = 0;
    }
    if (this._lastRetryTime) {
      await Session.signOut();
      console.warn('Could not refresh access token, signing out.');
      return;
    }

    this._lastRetryTime = Date.now();

    const tokenResponse = await this._authService.authControllerGetToken();
    if (!tokenResponse.ok) {
      console.warn('Could not get access token, signing out.');
      await Session.signOut();
      return;
    }
    const token = assertBody(tokenResponse).token;
    this._token = token;
    return token;
  }
}
