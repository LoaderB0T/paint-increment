export const drawContributorName = (
  ctx: CanvasRenderingContext2D,
  contributor: string,
  startX: number,
  availableSizePerIteration: number,
  startY: number,
  borderThickness: number,
  textSpace: number
) => {
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '44px Pixeled';
  ctx.fillText(
    contributor,
    startX + availableSizePerIteration * 0.5,
    startY + availableSizePerIteration + borderThickness + textSpace * 0.5 + 4
  );
};
