import { PaintLobbySettings } from './paint-lobby-settings.model';
import { PaintIncrement } from './paint-increment.model';

export interface PaintLobby {
  name: string;
  id: string;
  settings: PaintLobbySettings;
  increments: PaintIncrement[];
  creatorEmail: string;
  inviteCodes: string[];
}
