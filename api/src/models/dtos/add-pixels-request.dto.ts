import { IncrementPixel } from './increment-pixel.dto.js';

export class AddPixelsRequest {
  lobbyId!: string;
  name!: string;
  email!: string;
  pixels!: IncrementPixel[];
  inviteCode?: string;
}
