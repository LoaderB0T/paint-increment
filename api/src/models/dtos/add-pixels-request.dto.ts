import { IncrementPixel } from './increment-pixel.dto';

export class AddPixelsRequest {
  lobbyId!: string;
  name!: string;
  email!: string;
  pixels!: IncrementPixel[];
}
