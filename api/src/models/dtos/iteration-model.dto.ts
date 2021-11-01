import { IncrementPixel } from './increment-pixel.dto';

export class IterationModel {
  name!: string;
  pixels!: IncrementPixel[];
  confirmed!: boolean;
}
