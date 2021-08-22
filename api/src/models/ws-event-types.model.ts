import { WsCommunicationDefinitionsClientToServer, WsCommunicationDefinitionsServerToClient } from './ws-event-definitions.model';

export type WsCommunication = WsCommunicationDefinitionsClientToServer | WsCommunicationDefinitionsServerToClient;

export type WsReceiveMessage = WsCommunicationDefinitionsClientToServer['name'];
export type WsSendMessage = WsCommunicationDefinitionsServerToClient['name'];

export type ExtractPayload<A extends WsCommunication, T> = A extends { name: T } ? A['payload'] : never;
