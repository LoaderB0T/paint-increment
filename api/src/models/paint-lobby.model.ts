import { PaintIncrement } from './paint-increment.model.js';
import { PaintLobbySettings } from './paint-lobby-settings.model.js';

export interface PaintLobby {
  name: string;
  id: string;
  settings: PaintLobbySettings;
  increments: PaintIncrement[];
  creatorEmail: string;
  inviteCodes: string[];
}
