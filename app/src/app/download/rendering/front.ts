import { LobbyResponse } from '../../.api/models/lobby-response';
import { drawEdgePixels } from './front-draw-edge-pixels';
import { calculateEdgePixels } from './front-edge-pixels';
import { drawAllIterations } from './front-iterations';
import { drawYearInBottomRightCorner } from './front-year';

export const renderFront = async (lobby: LobbyResponse, color: string, transparent: boolean) => {
  const targetSize = 4000;
  const pixelLength = lobby.settings.width!;
  const textSpace = 6;
  const pixelCountWidth = pixelLength + 2;
  const pixelCountHeight = pixelLength + 2 + textSpace;

  const pixelSize = Math.floor(Math.min(targetSize / pixelCountWidth, targetSize / pixelCountHeight));

  const actualCanvasWidth = pixelSize * pixelCountWidth;
  const actualCanvasHeight = pixelSize * pixelCountHeight;

  const edgePixels = calculateEdgePixels(pixelCountWidth, pixelCountHeight, textSpace);

  const canvas = document.createElement('canvas');
  canvas.width = actualCanvasWidth;
  canvas.height = actualCanvasHeight;
  const ctx = canvas.getContext('2d')!;

  if (!transparent) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, actualCanvasWidth, actualCanvasHeight);
  }

  drawAllIterations(lobby, ctx, pixelSize);

  drawEdgePixels(ctx, color, edgePixels, pixelSize);

  drawYearInBottomRightCorner(pixelCountWidth, pixelSize, pixelCountHeight, textSpace, ctx);

  return canvas;
};
