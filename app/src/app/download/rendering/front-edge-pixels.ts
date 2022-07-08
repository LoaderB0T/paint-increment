export const calculateEdgePixels = (
  pixelCountWidth: number,
  pixelCountHeight: number,
  textSpace: number,
  renderYear: boolean
) => {
  const bottomPadding = renderYear ? textSpace : 0;
  const cornerTL = { x: 12, y: 6 };
  const cornerTR = { x: 7, y: 17 };
  const cornerBL = { x: 11, y: 6 };
  const cornerBR = { x: 15, y: 9 };

  const edgePixels = [];
  for (let i = 0; i < cornerTL.x; i++) {
    edgePixels.push({ x: i, y: 0 });
  }
  for (let i = 0; i < cornerTL.y; i++) {
    edgePixels.push({ x: 0, y: i });
  }
  for (let i = 0; i < cornerTR.x; i++) {
    edgePixels.push({ x: pixelCountWidth - i - 1, y: 0 });
  }
  for (let i = 0; i < cornerTR.y; i++) {
    edgePixels.push({ x: pixelCountWidth - 1, y: i });
  }
  for (let i = 0; i < cornerBL.x; i++) {
    edgePixels.push({ x: i, y: pixelCountHeight - 1 - bottomPadding });
  }
  for (let i = 0; i < cornerBL.y; i++) {
    edgePixels.push({ x: 0, y: pixelCountHeight - 1 - bottomPadding - i });
  }
  for (let i = 0; i < cornerBR.x; i++) {
    edgePixels.push({ x: pixelCountWidth - i - 1, y: pixelCountHeight - 1 - bottomPadding });
  }
  for (let i = 0; i < cornerBR.y; i++) {
    edgePixels.push({ x: pixelCountWidth - 1, y: pixelCountHeight - 1 - bottomPadding - i });
  }
  return edgePixels;
};
