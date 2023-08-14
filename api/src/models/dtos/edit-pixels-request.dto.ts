import { IncrementPixel } from './increment-pixel.dto';

export class EditPixelsRequest {
  lobbyId!: string;
  pixels!: IncrementPixel[];
  incrementId!: string;
}
