export const clearRowsForText = (
  rows: number,
  borderThickness: number,
  availableSizePerIteration: number,
  textSpace: number,
  transparent: boolean,
  ctx: CanvasRenderingContext2D,
  actualCanvasWidth: number
) => {
  for (let i = 0; i < rows; i++) {
    const y = (i + 1) * (2 * borderThickness + availableSizePerIteration) + i * textSpace;
    if (transparent) {
      ctx.clearRect(0, y, actualCanvasWidth, textSpace);
    } else {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, y, actualCanvasWidth, textSpace);
    }
  }
};
