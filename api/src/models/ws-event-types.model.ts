import {
  WsCommunicationDefinitionsClientToServer,
  WsCommunicationDefinitionsServerToClient,
} from './ws-event-definitions.model.js';

type FlattenUnion<T> = object extends T
  ? never
  : {
      [K in keyof T]: K extends keyof T
        ? T[K] extends any[]
          ? T[K]
          : T[K] extends object
            ? FlattenUnion<T[K]>
            : T[K]
        : T[K];
    };

export type WsCommunication =
  | WsCommunicationDefinitionsClientToServer
  | WsCommunicationDefinitionsServerToClient;

export type WsReceiveMessage = WsCommunicationDefinitionsClientToServer['name'];
export type WsSendMessage = WsCommunicationDefinitionsServerToClient['name'];

export type ExtractPayload<A extends WsCommunication, T> = FlattenUnion<
  A extends { name: T }
    ? ExtractPayloadInt<A> & {
        authToken?: string;
      }
    : never
>;

export type ExtractPayloadInt<A> = FlattenUnion<A extends { payload: any } ? A['payload'] : never>;
