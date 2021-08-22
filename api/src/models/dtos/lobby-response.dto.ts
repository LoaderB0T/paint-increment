import { PaintLobbySettings } from './create-lobby-request.dto';
import { IterationModel } from './iteration-model.dto';

export class LobbyResponse {
  id!: string;
  name!: string;
  pixelIterations!: IterationModel[];
  settings!: PaintLobbySettings;
  isCreator!: boolean;
}
