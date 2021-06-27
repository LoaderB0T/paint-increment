import { IncrementPixel } from './increment-pixel.dto';

export class IterationModel {
  name!: string;
  email!: string;
  pixels!: IncrementPixel[];
  confirmed!: boolean;
}
