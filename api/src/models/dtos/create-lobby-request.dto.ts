export class PaintLobbySettings {
  width!: number;
  height!: number;
  maxPixels!: number;
  timeLimit!: number;
}

export class CreateLobbyRequest {
  name!: string;
  ownerName!: string;
  settings!: PaintLobbySettings;
}
