export class WsPayload<T> {
  public endpoint: string;
  public payload: T;

  constructor(endpoint: string, payload: T) {
    this.endpoint = endpoint;
    this.payload = payload;
  }
}

export class WsAction<T> extends WsPayload<T> {
  constructor(action: string, payload: T) {
    super(action, payload);
  }
}
export class WsEvent<T> extends WsPayload<T> {
  constructor(event: string, payload: T) {
    super(event, payload);
  }
}

export class LockLobbyAction extends WsAction<string> {
  public constructor(lobbyId: string) {
    super('lockLobby', lobbyId);
  }
}

export class LookingAtLobbyAction extends WsAction<string> {
  public constructor(lobbyId: string) {
    super('lookingAtLobby', lobbyId);
  }
}

export class LobbyLockedEvent extends WsEvent<null> {
  public constructor() {
    super('lobbyLocked', null);
  }
}
