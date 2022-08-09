import { IncrementPixel } from './increment-pixel.dto';

export class IterationModel {
  name!: string;
  id!: string;
  pixels!: IncrementPixel[];
  confirmed!: boolean;
}
