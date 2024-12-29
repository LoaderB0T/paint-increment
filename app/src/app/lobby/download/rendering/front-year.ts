import { getPixelText } from './pixel-text';

export const drawYearInBottomRightCorner = (
  pixelCountWidth: number,
  pixelSize: number,
  pixelCountHeight: number,
  textSpace: number,
  ctx: CanvasRenderingContext2D
) => {
  const now = new Date();
  const year = now.getFullYear();
  const yearNumbers = year
    .toString()
    .split('')
    .map(c => parseInt(c, 10));
  const yearNumbersPixels = yearNumbers.map(n => getPixelText(n));
  const yearBaseX = (pixelCountWidth - 4 * 4 + 1) * pixelSize;
  const yearBaseY = (pixelCountHeight - textSpace + 1) * pixelSize;

  ctx.fillStyle = 'black';
  for (let n = 0; n < yearNumbersPixels.length; n++) {
    const yearNumberPixels = yearNumbersPixels[n];
    for (let rowIndex = 0; rowIndex < yearNumberPixels.length; rowIndex++) {
      const row = yearNumberPixels[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const pixel = row[colIndex];
        if (pixel) {
          ctx.fillRect(yearBaseX + (colIndex + n * 4) * pixelSize, yearBaseY + rowIndex * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }
};
