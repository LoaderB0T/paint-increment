export type WsCommunicationDefinitionsClientToServer =
  | { name: 'lockLobby'; payload: { lobbyId: string } }
  | { name: 'unlockLobby'; payload: { lobbyId: string } }
  | { name: 'lookAtLobby'; payload: { lobbyId: string } };

export type WsCommunicationDefinitionsServerToClient =
  | { name: 'lobbyLocked'; payload: { isLocked: boolean } }
  | { name: 'lobbyReserved'; payload: { isReserved: boolean } };

export type WsCommunication = WsCommunicationDefinitionsClientToServer | WsCommunicationDefinitionsServerToClient;

export type WsSendMessage = WsCommunicationDefinitionsClientToServer['name'];
export type WsReceiveMessage = WsCommunicationDefinitionsServerToClient['name'];

export type ExtractPayload<A extends WsCommunication, T> = A extends { name: T } ? A['payload'] : never;
