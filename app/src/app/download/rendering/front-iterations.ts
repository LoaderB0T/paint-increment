import { LobbyResponse } from '../../.api/models/lobby-response';

export const drawAllIterations = (lobby: LobbyResponse, ctx: CanvasRenderingContext2D, pixelSize: number) => {
  lobby.pixelIterations.forEach(iteration => {
    iteration.pixels.forEach(p => {
      ctx.fillStyle = 'black';
      ctx.fillRect((p.x + 1) * pixelSize, (p.y + 1) * pixelSize, pixelSize, pixelSize);
    });
  });
};
