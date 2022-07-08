import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyResponse } from '../.api/models/lobby-response';
import { ActionItem } from '../models/action-item.model';
import * as JsZip from 'jszip';
import { saveAs } from 'file-saver';
import { DialogService } from '../services/dialog.service';
import { DownloadComponent } from '../dialogs/download/download.component';
import { getPixelText } from './pixel-text';

@Component({
  templateUrl: './lobby-iterations.component.html',
  styleUrls: ['./lobby-iterations.component.scss']
})
export class LobbyIterationsComponent implements AfterViewInit {
  private readonly _activatedRoute: ActivatedRoute;
  private readonly _dialogService: DialogService;
  private readonly _router: Router;
  public lobby: LobbyResponse;

  @ViewChildren('canvas')
  canvas!: QueryList<ElementRef<HTMLCanvasElement>>;
  public zoomValue: number = 300;

  public actionItems: ActionItem[] = [
    {
      text: 'Back to lobby',
      icon: 'left',
      action: () => this.back(),
      visible: () => true
    },
    {
      text: 'Download Images',
      icon: 'download',
      action: () => this.download(),
      visible: () => true
    }
  ];

  constructor(activatedRoute: ActivatedRoute, dialogService: DialogService, router: Router) {
    this._activatedRoute = activatedRoute;
    this._dialogService = dialogService;
    this._router = router;

    this.lobby = this._activatedRoute.snapshot.data.lobby as LobbyResponse;
  }

  public get width(): number {
    return this.lobby.settings.width!;
  }

  public get height(): number {
    return this.lobby.settings.height!;
  }

  public ngAfterViewInit(): void {
    for (let i = 0; i < this.lobby.pixelIterations.length; i++) {
      const ctx = this.canvas.get(i)!.nativeElement.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, this.lobby.settings.width!, this.lobby.settings.height!);
      for (let j = 0; j <= i; j++) {
        ctx.fillStyle = j === i ? 'green' : 'black';
        const iteration = this.lobby.pixelIterations[j];
        iteration.pixels.forEach(p => {
          ctx.fillRect(p.x, p.y, 1, 1);
        });
      }
    }
  }

  public scroll(event: WheelEvent) {
    if (event.shiftKey) {
      this.zoomValue += Math.sign(event.deltaY) * -10;
      if (this.zoomValue > 1000) {
        this.zoomValue = 1000;
      } else if (this.zoomValue < 150) {
        this.zoomValue = 150;
      }
      event.preventDefault();
    }
  }

  private back() {
    this._router.navigate(['lobby', this.lobby.id]);
  }

  private download() {
    this._dialogService.showComponentDialog(DownloadComponent).result.then(response => {
      if (!response) {
        return;
      }
      if (response.back) {
        this.downloadBack(response.color, response.transparent, response.columns);
      } else if (response.front) {
        this.downloadFront(response.color, response.transparent);
      } else {
        this.downloadImages(response.color, response.transparent);
      }
    });
  }

  private async downloadBack(color: string, transparent: boolean, columns: number) {
    const myFont = new FontFace('Pixeled', 'url(/assets/Pixeled.ttf)');
    const font = await myFont.load();

    document.fonts.add(font);

    const targetSize = 4000;
    const rows = Math.ceil(this.lobby.pixelIterations.length / columns);
    const borderThickness = 12;
    const textSpace = 70;
    const pixelLength = this.lobby.settings.width!;

    const availableHeight = targetSize - 2 * rows * borderThickness - rows * textSpace;
    const availableWidth = targetSize - (columns + 1) * borderThickness;

    const availableHeightPerRow = availableHeight / rows;
    const availableWidthPerColumn = availableWidth / columns;

    const availableSizePerIteration =
      Math.floor(Math.min(availableHeightPerRow / pixelLength, availableWidthPerColumn / pixelLength)) * pixelLength;

    const pixelSize = availableSizePerIteration / pixelLength;

    const actualCanvasWidth = availableSizePerIteration * columns + (columns + 1) * borderThickness;
    const actualCanvasHeight = availableSizePerIteration * rows + 2 * rows * borderThickness + rows * textSpace;

    const canvas = document.createElement('canvas');
    canvas.width = actualCanvasWidth;
    canvas.height = actualCanvasHeight;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, actualCanvasWidth, actualCanvasHeight);

    this.drawSquaresForIterations(columns, borderThickness, availableSizePerIteration, textSpace, transparent, ctx);
    this.clearRowsForText(rows, borderThickness, availableSizePerIteration, textSpace, transparent, ctx, actualCanvasWidth);

    for (let i = 0; i < this.lobby.pixelIterations.length; i++) {
      const contributor = this.lobby.pixelIterations[i].name;
      const x = i % columns;
      const y = Math.floor(i / columns);
      const startX = x * (borderThickness + availableSizePerIteration) + borderThickness;
      const startY = y * (2 * borderThickness + availableSizePerIteration + textSpace) + borderThickness;

      this.drawContributorName(ctx, contributor, startX, availableSizePerIteration, startY, borderThickness, textSpace);

      this.drawContributorsIterationInSquare(i, ctx, color, startX, pixelSize, startY);
    }

    canvas.toBlob(blob => {
      saveAs(blob!, `${this.lobby.name}_${color}_back${transparent ? '_T' : ''}.png`);
    });
  }

  private drawContributorsIterationInSquare(
    i: number,
    ctx: CanvasRenderingContext2D,
    color: string,
    startX: number,
    pixelSize: number,
    startY: number
  ) {
    for (let j = 0; j <= i; j++) {
      ctx.fillStyle = j === i ? color : 'black';
      const iteration = this.lobby.pixelIterations[j];
      iteration.pixels.forEach(p => {
        ctx.fillRect(startX + p.x * pixelSize, startY + p.y * pixelSize, pixelSize, pixelSize);
      });
    }
  }

  private drawContributorName(
    ctx: CanvasRenderingContext2D,
    contributor: string,
    startX: number,
    availableSizePerIteration: number,
    startY: number,
    borderThickness: number,
    textSpace: number
  ) {
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '44px Pixeled';
    ctx.fillText(
      contributor,
      startX + availableSizePerIteration * 0.5,
      startY + availableSizePerIteration + borderThickness + textSpace * 0.5 + 4
    );
  }

  private clearRowsForText(
    rows: number,
    borderThickness: number,
    availableSizePerIteration: number,
    textSpace: number,
    transparent: boolean,
    ctx: CanvasRenderingContext2D,
    actualCanvasWidth: number
  ) {
    for (let i = 0; i < rows; i++) {
      const y = (i + 1) * (2 * borderThickness + availableSizePerIteration) + i * textSpace;
      if (transparent) {
        ctx.clearRect(0, y, actualCanvasWidth, textSpace);
      } else {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, y, actualCanvasWidth, textSpace);
      }
    }
  }

  private drawSquaresForIterations(
    columns: number,
    borderThickness: number,
    availableSizePerIteration: number,
    textSpace: number,
    transparent: boolean,
    ctx: CanvasRenderingContext2D
  ) {
    for (let i = 0; i < this.lobby.pixelIterations.length; i++) {
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
  }

  private downloadFront(color: string, transparent: boolean) {
    const targetSize = 4000;
    const pixelLength = this.lobby.settings.width!;
    const textSpace = 6;
    const pixelCountWidth = pixelLength + 2;
    const pixelCountHeight = pixelLength + 2 + textSpace;

    const pixelSize = Math.floor(Math.min(targetSize / pixelCountWidth, targetSize / pixelCountHeight));

    const actualCanvasWidth = pixelSize * pixelCountWidth;
    const actualCanvasHeight = pixelSize * pixelCountHeight;

    const edgePixels = this.calculateEdgePixels(pixelCountWidth, pixelCountHeight, textSpace);

    const canvas = document.createElement('canvas');
    canvas.width = actualCanvasWidth;
    canvas.height = actualCanvasHeight;
    const ctx = canvas.getContext('2d')!;

    if (!transparent) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, actualCanvasWidth, actualCanvasHeight);
    }

    this.drawAllIterations(ctx, pixelSize);

    this.drawEdgePixels(ctx, color, edgePixels, pixelSize);

    this.drawYearInBottomRightCorner(pixelCountWidth, pixelSize, pixelCountHeight, textSpace, ctx);

    canvas.toBlob(blob => {
      saveAs(blob!, `${this.lobby.name}_${color}_front${transparent ? '_T' : ''}.png`);
    });
  }

  private drawYearInBottomRightCorner(
    pixelCountWidth: number,
    pixelSize: number,
    pixelCountHeight: number,
    textSpace: number,
    ctx: CanvasRenderingContext2D
  ) {
    const now = new Date();
    const year = now.getFullYear();
    const yearNumbers = year
      .toString()
      .split('')
      .map(c => parseInt(c, 10));
    const yearNumbersPixels = yearNumbers.map(n => getPixelText(n));
    const yearBaseX = (pixelCountWidth - 4 * 4 + 1) * pixelSize;
    const yearBaseY = (pixelCountHeight - textSpace + 1) * pixelSize;

    ctx.fillStyle = 'black';
    for (let n = 0; n < yearNumbersPixels.length; n++) {
      const yearNumberPixels = yearNumbersPixels[n];
      for (let rowIndex = 0; rowIndex < yearNumberPixels.length; rowIndex++) {
        const row = yearNumberPixels[rowIndex];
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          const pixel = row[colIndex];
          if (pixel) {
            ctx.fillRect(yearBaseX + (colIndex + n * 4) * pixelSize, yearBaseY + rowIndex * pixelSize, pixelSize, pixelSize);
          }
        }
      }
    }
  }

  private drawEdgePixels(
    ctx: CanvasRenderingContext2D,
    color: string,
    edgePixels: { x: number; y: number }[],
    pixelSize: number
  ) {
    ctx.fillStyle = color;
    edgePixels.forEach(p => {
      ctx.fillRect(p.x * pixelSize, p.y * pixelSize, pixelSize, pixelSize);
    });
  }

  private drawAllIterations(ctx: CanvasRenderingContext2D, pixelSize: number) {
    this.lobby.pixelIterations.forEach(iteration => {
      iteration.pixels.forEach(p => {
        ctx.fillStyle = 'black';
        ctx.fillRect((p.x + 1) * pixelSize, (p.y + 1) * pixelSize, pixelSize, pixelSize);
      });
    });
  }

  private calculateEdgePixels(pixelCountWidth: number, pixelCountHeight: number, textSpace: number) {
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
      edgePixels.push({ x: i, y: pixelCountHeight - 1 - textSpace });
    }
    for (let i = 0; i < cornerBL.y; i++) {
      edgePixels.push({ x: 0, y: pixelCountHeight - 1 - textSpace - i });
    }
    for (let i = 0; i < cornerBR.x; i++) {
      edgePixels.push({ x: pixelCountWidth - i - 1, y: pixelCountHeight - 1 - textSpace });
    }
    for (let i = 0; i < cornerBR.y; i++) {
      edgePixels.push({ x: pixelCountWidth - 1, y: pixelCountHeight - 1 - textSpace - i });
    }
    return edgePixels;
  }

  private downloadImages(color: string, transparent: boolean) {
    const targetSize = 2048;
    let size = 0;
    while (size < targetSize) {
      size += this.lobby.settings.width!;
    }
    const pixelSize = size / this.lobby.settings.width!;
    const zip = new JsZip();
    for (let i = 0; i < this.lobby.pixelIterations.length; i++) {
      const el = document.createElement('canvas');
      el.width = size;
      el.height = size;
      const ctx = el.getContext('2d')!;

      if (!transparent) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
      }

      for (let j = 0; j <= i; j++) {
        ctx.fillStyle = j === i ? color : 'black';
        const iteration = this.lobby.pixelIterations[j];
        iteration.pixels.forEach(p => {
          ctx.fillRect(p.x * pixelSize, p.y * pixelSize, pixelSize, pixelSize);
        });
      }
      const imgString = el.toDataURL('image/png');

      zip.file(`${i}.png`, imgString.split('base64,')[1], { base64: true });
    }
    zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(content, `${this.lobby.name}_${color}${transparent ? '_T' : ''}.zip`);
    });
  }
}
