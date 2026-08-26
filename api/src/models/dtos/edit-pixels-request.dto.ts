import { IncrementPixel } from './increment-pixel.dto.js';

export class EditPixelsRequest {
  public lobbyId!: string;
  public pixels!: IncrementPixel[];
  public incrementId!: string;
}
