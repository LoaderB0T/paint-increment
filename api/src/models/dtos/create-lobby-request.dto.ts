export class PaintLobbySettings {
  public width!: number;
  public height!: number;
  public maxPixels!: number;
  public timeLimit!: number;
}

export class CreateLobbyRequest {
  public name!: string;
  public ownerName!: string;
  public settings!: PaintLobbySettings;
}
