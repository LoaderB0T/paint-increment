import { LobbyResponse } from '@shared/api';

export const drawContributorsIterationInSquare = (
  lobby: LobbyResponse,
  i: number,
  ctx: CanvasRenderingContext2D,
  color: string,
  startX: number,
  pixelSize: number,
  startY: number
) => {
  for (let j = 0; j <= i; j++) {
    ctx.fillStyle = j === i ? color : 'black';
    const iteration = lobby.pixelIterations[j];
    iteration.pixels.forEach(p => {
      ctx.fillRect(startX + p.x * pixelSize, startY + p.y * pixelSize, pixelSize, pixelSize);
    });
  }
};
