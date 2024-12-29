import { LobbyResponse } from '@shared/api';

export const drawAllIterations = (
  lobby: LobbyResponse,
  ctx: CanvasRenderingContext2D,
  pixelSize: number,
  renderEdgePixels: boolean
) => {
  const skipPixelCount = renderEdgePixels ? 1 : 0;
  lobby.pixelIterations.forEach(iteration => {
    iteration.pixels.forEach(p => {
      ctx.fillStyle = 'black';
      ctx.fillRect(
        (p.x + skipPixelCount) * pixelSize,
        (p.y + skipPixelCount) * pixelSize,
        pixelSize,
        pixelSize
      );
    });
  });
};
