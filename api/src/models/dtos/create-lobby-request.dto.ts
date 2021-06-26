import { PaintLobbySettings } from '../paint-lobby-settins.model';

export interface CreateLobbyRequest {
  name: string;
  settings?: Partial<PaintLobbySettings>;
}
