import { LobbyResponse } from '@shared/api';
import { throwExp } from '@shared/utils';

import { drawEdgePixels } from './front-draw-edge-pixels';
import { calculateEdgePixels } from './front-edge-pixels';
import { drawAllIterations } from './front-iterations';
import { drawYearInBottomRightCorner } from './front-year';
import { DownloadSettings } from '../../../dialog/download-settings/download-settings.model';

export const renderFront = async (
  lobby: LobbyResponse,
  settings: DownloadSettings,
  document: Document
) => {
  const targetSize = 4000;
  const pixelLength = lobby.settings.width;
  const textSpace = 6;
  const pixelCountWidth = pixelLength + (settings.renderEdges ? 2 : 0);
  const pixelCountHeight =
    pixelLength + (settings.renderEdges ? 2 : 0) + (settings.renderYear ? textSpace : 0);

  const pixelSize = Math.floor(
    Math.min(targetSize / pixelCountWidth, targetSize / pixelCountHeight)
  );

  const actualCanvasWidth = pixelSize * pixelCountWidth;
  const actualCanvasHeight = pixelSize * pixelCountHeight;

  const canvas = document.createElement('canvas');
  canvas.width = actualCanvasWidth;
  canvas.height = actualCanvasHeight;
  const ctx = canvas.getContext('2d') ?? throwExp('Canvas not supported');

  if (!settings.transparentBackground) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, actualCanvasWidth, actualCanvasHeight);
  }

  drawAllIterations(lobby, ctx, pixelSize, settings.renderEdges);

  if (settings.renderEdges) {
    const edgePixels = calculateEdgePixels(
      pixelCountWidth,
      pixelCountHeight,
      textSpace,
      settings.renderYear
    );
    drawEdgePixels(ctx, settings.accentColor, edgePixels, pixelSize);
  }

  if (settings.renderYear) {
    drawYearInBottomRightCorner(pixelCountWidth, pixelSize, pixelCountHeight, textSpace, ctx);
  }

  return canvas;
};
