export type WsCommunicationDefinitionsClientToServer =
  | { name: 'lockLobby'; payload: { lobbyId: string } }
  | { name: 'unlockLobby'; payload: { lobbyId: string } }
  | { name: 'lookAtLobby'; payload: { lobbyId: string } };

export type WsCommunicationDefinitionsServerToClient =
  | { name: 'lobbyLocked'; payload: { isLocked: boolean } }
  | { name: 'reservationTime'; payload: { timeLeft: number } }
  | { name: 'lobbyReserved'; payload: { isReserved: boolean } };
