import { LobbyResponse } from '../../.api/models/lobby-response';

export const drawSquaresForIterations = (
  lobby: LobbyResponse,
  columns: number,
  borderThickness: number,
  availableSizePerIteration: number,
  textSpace: number,
  transparent: boolean,
  ctx: CanvasRenderingContext2D
) => {
  for (let i = 0; i < lobby.pixelIterations.length; i++) {
    const x = i % columns;
    const y = Math.floor(i / columns);

    const startX = x * (borderThickness + availableSizePerIteration) + borderThickness;
    const startY = y * (2 * borderThickness + availableSizePerIteration + textSpace) + borderThickness;
    const width = availableSizePerIteration;
    const height = availableSizePerIteration;
    if (transparent) {
      ctx.clearRect(startX, startY, width, height);
    } else {
      ctx.fillStyle = 'white';
      ctx.fillRect(startX, startY, width, height);
    }
  }
};
