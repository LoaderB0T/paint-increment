import { LobbyResponse } from '@shared/api';
import { throwExp } from '@shared/utils';

import { drawEdgePixels } from './front-draw-edge-pixels';
import { calculateEdgePixels } from './front-edge-pixels';
import { drawAllIterations } from './front-iterations';
import { drawYearInBottomRightCorner } from './front-year';

export const renderFront = async (
  lobby: LobbyResponse,
  color: string,
  transparent: boolean,
  renderYear: boolean,
  renderEdgePixels: boolean
) => {
  const targetSize = 4000;
  const pixelLength = lobby.settings.width;
  const textSpace = 6;
  const pixelCountWidth = pixelLength + (renderEdgePixels ? 2 : 0);
  const pixelCountHeight = pixelLength + (renderEdgePixels ? 2 : 0) + (renderYear ? textSpace : 0);

  const pixelSize = Math.floor(
    Math.min(targetSize / pixelCountWidth, targetSize / pixelCountHeight)
  );

  const actualCanvasWidth = pixelSize * pixelCountWidth;
  const actualCanvasHeight = pixelSize * pixelCountHeight;

  const canvas = document.createElement('canvas');
  canvas.width = actualCanvasWidth;
  canvas.height = actualCanvasHeight;
  const ctx = canvas.getContext('2d') ?? throwExp('Canvas not supported');

  if (!transparent) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, actualCanvasWidth, actualCanvasHeight);
  }

  drawAllIterations(lobby, ctx, pixelSize, renderEdgePixels);

  if (renderEdgePixels) {
    const edgePixels = calculateEdgePixels(
      pixelCountWidth,
      pixelCountHeight,
      textSpace,
      renderYear
    );
    drawEdgePixels(ctx, color, edgePixels, pixelSize);
  }

  if (renderYear) {
    drawYearInBottomRightCorner(pixelCountWidth, pixelSize, pixelCountHeight, textSpace, ctx);
  }

  return canvas;
};
