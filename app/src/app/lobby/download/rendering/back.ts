import { LobbyResponse } from '@shared/api';
import { throwExp } from '@shared/utils';

import { drawContributorsIterationInSquare } from './back-iterations';
import { clearRowsForText } from './back-name-rows';
import { drawContributorName } from './back-names';
import { drawSquaresForIterations } from './back-squares';
import { DownloadSettings } from '../../../dialog/download-settings/download-settings.model';

export const renderBack = async (
  lobby: LobbyResponse,
  settings: DownloadSettings,
  document: Document
) => {
  const myFont = new FontFace('Pixeled', 'url(/Pixeled.ttf)');
  const font = await myFont.load();

  (document.fonts as any).add(font);

  const targetSize = 4000;
  const rows = Math.ceil(lobby.pixelIterations.length / settings.columnCount);
  const borderThickness = 12;
  const textSpace = 70;
  const pixelLength = lobby.settings.width;

  const availableHeight = targetSize - 2 * rows * borderThickness - rows * textSpace;
  const availableWidth = targetSize - (settings.columnCount + 1) * borderThickness;

  const availableHeightPerRow = availableHeight / rows;
  const availableWidthPerColumn = availableWidth / settings.columnCount;

  const availableSizePerIteration =
    Math.floor(
      Math.min(availableHeightPerRow / pixelLength, availableWidthPerColumn / pixelLength)
    ) * pixelLength;

  const pixelSize = availableSizePerIteration / pixelLength;

  const actualCanvasWidth =
    availableSizePerIteration * settings.columnCount + (settings.columnCount + 1) * borderThickness;
  const actualCanvasHeight =
    availableSizePerIteration * rows + 2 * rows * borderThickness + rows * textSpace;

  const canvas = document.createElement('canvas');
  canvas.width = actualCanvasWidth;
  canvas.height = actualCanvasHeight;
  const ctx = canvas.getContext('2d') ?? throwExp('Canvas not supported');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, actualCanvasWidth, actualCanvasHeight);

  drawSquaresForIterations(
    lobby,
    settings.columnCount,
    borderThickness,
    availableSizePerIteration,
    textSpace,
    settings.transparentBackground,
    ctx
  );
  clearRowsForText(
    rows,
    borderThickness,
    availableSizePerIteration,
    textSpace,
    settings.transparentBackground,
    ctx,
    actualCanvasWidth
  );

  for (let i = 0; i < lobby.pixelIterations.length; i++) {
    const contributor = lobby.pixelIterations[i].name;
    const x = i % settings.columnCount;
    const y = Math.floor(i / settings.columnCount);
    const startX = x * (borderThickness + availableSizePerIteration) + borderThickness;
    const startY =
      y * (2 * borderThickness + availableSizePerIteration + textSpace) + borderThickness;

    drawContributorName(
      ctx,
      contributor,
      startX,
      availableSizePerIteration,
      startY,
      borderThickness,
      textSpace
    );

    drawContributorsIterationInSquare(
      lobby,
      i,
      ctx,
      settings.accentColor,
      startX,
      pixelSize,
      startY
    );
  }

  return canvas;
};
