import { WsCommunicationDefinitionsClientToServer, WsCommunicationDefinitionsServerToClient } from './ws-event-definitions.model';

type AddUidToType<T> = T & { uid: string };

type A<T extends WsCommunicationDefinitionsClientToServer> = T extends { payload: any }
  ? Omit<T, 'payload'> & {
      payload: AddUidToType<T['payload']>;
    }
  : never;

type WsCommunicationDefinitionsClientToServer2 = A<WsCommunicationDefinitionsClientToServer>;

type FlattenUnion<T> = {} extends T
  ? never
  : {
      [K in keyof T]: K extends keyof T ? (T[K] extends any[] ? T[K] : T[K] extends object ? FlattenUnion<T[K]> : T[K]) : T[K];
    };

export type WsCommunication = WsCommunicationDefinitionsClientToServer2 | WsCommunicationDefinitionsServerToClient;

export type WsReceiveMessage = WsCommunicationDefinitionsClientToServer2['name'];
export type WsSendMessage = WsCommunicationDefinitionsServerToClient['name'];

export type ExtractPayload<A extends WsCommunication, T> = FlattenUnion<A extends { name: T } ? A['payload'] : never>;
