import { IncrementPixel } from '@shared/api';

export function pixelArrayToIncrementPixel(pixels: boolean[][]): IncrementPixel[] {
  const newPixels: IncrementPixel[] = [];
  for (let x = 0; x < pixels.length; x++) {
    const row = pixels[x];
    for (let y = 0; y < row.length; y++) {
      const element = row[y];
      if (element) {
        newPixels.push({ x, y });
      }
    }
  }
  return newPixels;
}
