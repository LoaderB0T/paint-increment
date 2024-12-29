import { LobbyResponse } from '@shared/api';
import { throwExp } from '@shared/utils';

import { drawContributorsIterationInSquare } from './back-iterations';
import { clearRowsForText } from './back-name-rows';
import { drawContributorName } from './back-names';
import { drawSquaresForIterations } from './back-squares';

export const renderBack = async (
  lobby: LobbyResponse,
  color: string,
  transparent: boolean,
  columns: number
) => {
  const myFont = new FontFace('Pixeled', 'url(/assets/Pixeled.ttf)');
  const font = await myFont.load();

  document.fonts.add(font);

  const targetSize = 4000;
  const rows = Math.ceil(lobby.pixelIterations.length / columns);
  const borderThickness = 12;
  const textSpace = 70;
  const pixelLength = lobby.settings.width;

  const availableHeight = targetSize - 2 * rows * borderThickness - rows * textSpace;
  const availableWidth = targetSize - (columns + 1) * borderThickness;

  const availableHeightPerRow = availableHeight / rows;
  const availableWidthPerColumn = availableWidth / columns;

  const availableSizePerIteration =
    Math.floor(
      Math.min(availableHeightPerRow / pixelLength, availableWidthPerColumn / pixelLength)
    ) * pixelLength;

  const pixelSize = availableSizePerIteration / pixelLength;

  const actualCanvasWidth = availableSizePerIteration * columns + (columns + 1) * borderThickness;
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
    columns,
    borderThickness,
    availableSizePerIteration,
    textSpace,
    transparent,
    ctx
  );
  clearRowsForText(
    rows,
    borderThickness,
    availableSizePerIteration,
    textSpace,
    transparent,
    ctx,
    actualCanvasWidth
  );

  for (let i = 0; i < lobby.pixelIterations.length; i++) {
    const contributor = lobby.pixelIterations[i].name;
    const x = i % columns;
    const y = Math.floor(i / columns);
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

    drawContributorsIterationInSquare(lobby, i, ctx, color, startX, pixelSize, startY);
  }

  return canvas;
};
