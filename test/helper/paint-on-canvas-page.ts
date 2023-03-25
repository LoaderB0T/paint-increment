import { Page } from '@playwright/test';

export class PaintOnCanvasPage {
  private readonly _page: Page;
  constructor(page: Page) {
    this._page = page;
  }

  public async paintPixel(x: number, y: number) {
    const elementHandle = await this._page
      .locator('#paint-canvas')
      .elementHandle()
      .then(e => e?.asElement());
    const pixelWidth = await elementHandle?.getAttribute('width');
    const pixelHeight = await elementHandle?.getAttribute('height');
    const width = await elementHandle?.boundingBox().then(b => b?.width);
    const height = await elementHandle?.boundingBox().then(b => b?.height);
    if (!pixelWidth || !pixelHeight || !width || !height) throw new Error('Could not get canvas dimensions');

    const pixelWidthNumber = parseInt(pixelWidth, 10);
    const pixelHeightNumber = parseInt(pixelHeight, 10);

    await this._page.click('#paint-canvas', {
      position: {
        x: (x * width) / pixelWidthNumber - 1,
        y: (y * height) / pixelHeightNumber - 1
      }
    });
  }
}
