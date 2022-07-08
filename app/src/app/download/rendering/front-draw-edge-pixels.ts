export const drawEdgePixels = (
  ctx: CanvasRenderingContext2D,
  color: string,
  edgePixels: { x: number; y: number }[],
  pixelSize: number
) => {
  ctx.fillStyle = color;
  edgePixels.forEach(p => {
    ctx.fillRect(p.x * pixelSize, p.y * pixelSize, pixelSize, pixelSize);
  });
};
