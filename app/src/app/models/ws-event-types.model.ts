import { WsCommunicationDefinitionsClientToServer, WsCommunicationDefinitionsServerToClient } from './ws-event-definitions.model';

export type WsCommunication = WsCommunicationDefinitionsClientToServer | WsCommunicationDefinitionsServerToClient;

export type WsSendMessage = WsCommunicationDefinitionsClientToServer['name'];
export type WsReceiveMessage = WsCommunicationDefinitionsServerToClient['name'];

export type ExtractPayload<A extends WsCommunication, T> = A extends { name: T } ? A['payload'] : never;
