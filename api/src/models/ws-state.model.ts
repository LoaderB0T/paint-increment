export class LockState {
  [lobbyId: string]: {
    lockedBy: string | null;
    lookingAtLobby: string[];
  };
}

export class UserState {
  [userId: string]: {
    lobbies: string[];
  };
}

export class WsState {
  public static readonly lockState = new LockState();
  public static readonly userState = new UserState();
}
