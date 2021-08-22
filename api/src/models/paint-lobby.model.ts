import { PaintLobbySettings } from './paint-lobby-settins.model';
import { PaintIncrement } from './paint-increment.model';

export interface PaintLobby {
  name: string;
  id: string;
  settings: PaintLobbySettings;
  increments: PaintIncrement[];
  creatorUid: string;
  inviteCodes: string[];
}
