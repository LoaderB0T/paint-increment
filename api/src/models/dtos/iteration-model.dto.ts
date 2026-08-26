import { IncrementPixel } from './increment-pixel.dto.js';

export class IterationModel {
  public name!: string;
  public id!: string;
  public pixels!: IncrementPixel[];
  public confirmed!: boolean;
}
