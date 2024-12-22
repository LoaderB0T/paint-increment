import { IncrementPixel } from './increment-pixel.dto.js';

export class IterationModel {
  name!: string;
  id!: string;
  pixels!: IncrementPixel[];
  confirmed!: boolean;
}
