export class PaintLobbySettings {
  width?: number;
  height?: number;
  maxPixels!: number;
}

export class CreateLobbyRequest {
  name!: string;
  email!: string;
  settings!: PaintLobbySettings;
  uid!: string;
}
