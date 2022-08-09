export type WsCommunicationDefinitionsClientToServer =
  | { name: 'discardDrawing'; payload: { lobbyId: string } }
  | { name: 'lockLobby'; payload: { lobbyId: string; name: string; inviteCode?: string } }
  | { name: 'unlockLobby'; payload: { lobbyId: string } }
  | { name: 'lookAtLobby'; payload: { lobbyId: string } }
  | { name: 'deleteIteration'; payload: { lobbyId: string; iterationId: string } }
  | { name: 'changeIterationName'; payload: { lobbyId: string; iterationId: string; newName: string } }
  | { name: 'changeIterationIndex'; payload: { lobbyId: string; iterationId: string; newIndex: number } };

export type WsCommunicationDefinitionsServerToClient =
  | { name: 'lobbyLocked'; payload: { isLocked: boolean; lockedBy?: string } }
  | { name: 'reservationTime'; payload: { timeLeft: number } }
  | { name: 'lobbyReserved'; payload: { isReserved: boolean } };
