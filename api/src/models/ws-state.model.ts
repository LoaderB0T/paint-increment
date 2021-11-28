import { Socket } from 'socket.io';

export class LockState {
  [lobbyId: string]: {
    lockedBy: string | null;
    lockedByName: string | null;
    interval?: number;
    timeoutTime?: number;
    lookingAtLobby: string[];
  };
}

export class UserState {
  [userId: string]: {
    lobbies: string[];
  };
}

export class ClientState {
  [userId: string]: Socket;
}

export class WsState {
  public static readonly lockState = new LockState();
  public static readonly userState = new UserState();
  public static readonly clientState = new ClientState();

  public static getClientByUserId(userId: string): Socket {
    return WsState.clientState[userId];
  }

  public static deleteTimeout(lockData: LockState[string]): void {
    if (lockData.interval) {
      clearInterval(lockData.interval);
    }
    lockData.interval = undefined;
  }
}
