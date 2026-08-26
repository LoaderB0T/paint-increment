import { PaintLobbySettings } from './create-lobby-request.dto.js';
import { IterationModel } from './iteration-model.dto.js';

export class LobbyResponse {
  public id!: string;
  public name!: string;
  public pixelIterations!: IterationModel[];
  public settings!: PaintLobbySettings;
  public isCreator!: boolean;
}
