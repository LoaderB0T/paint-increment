export class PaintLobbySettings {
  width?: number;
  height?: number;
  maxPixels?: number;
}

export class CreateLobbyRequest {
  name!: string;
  settings?: PaintLobbySettings;
  uid!: string;
}
