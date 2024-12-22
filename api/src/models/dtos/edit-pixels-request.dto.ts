import { IncrementPixel } from './increment-pixel.dto.js';

export class EditPixelsRequest {
  lobbyId!: string;
  pixels!: IncrementPixel[];
  incrementId!: string;
}
