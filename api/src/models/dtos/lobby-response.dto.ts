import { PaintLobbySettings } from './create-lobby-request.dto.js';
import { IterationModel } from './iteration-model.dto.js';

export class LobbyResponse {
  id!: string;
  name!: string;
  pixelIterations!: IterationModel[];
  settings!: PaintLobbySettings;
  isCreator!: boolean;
}
