import { IncrementPixel } from './increment-pixel.dto.js';

export class AddPixelsRequest {
  public lobbyId!: string;
  public name!: string;
  public email!: string;
  public pixels!: IncrementPixel[];
  public inviteCode?: string;
}
