import {
  WsCommunicationDefinitionsClientToServer,
  WsCommunicationDefinitionsServerToClient,
} from './ws-event-definitions.model';

export type WsCommunication =
  | WsCommunicationDefinitionsClientToServer
  | WsCommunicationDefinitionsServerToClient;

export type WsSendMessage = WsCommunicationDefinitionsClientToServer['name'];
export type WsReceiveMessage = WsCommunicationDefinitionsServerToClient['name'];

export type ExtractPayload<A extends WsCommunication, T> = A extends { name: T }
  ? ExtractPayloadInt<A> & {
      authToken?: string;
      uid?: string;
    }
  : never;

export type ExtractPayloadInt<A> = A extends { payload: any } ? A['payload'] : never;
