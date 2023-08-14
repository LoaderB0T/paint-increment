import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type CanvasSettings = {
  width: number;
  height: number;
  canvasPattern: boolean;
  maxPixels: number;
};

export type Layer = {
  color: string;
  pixels: boolean[][];
};

const canvasPatternColor = '#e3e3e3';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  private readonly _settings = signal<Required<CanvasSettings>>({
    width: 0,
    height: 0,
    canvasPattern: true,
    maxPixels: 0,
  });
  private readonly _layers = signal<Layer[]>([]);
  private readonly _canPaint = signal<boolean>(false);

  private _dragging: boolean = false;
  private _drawing: boolean = false;
  private _erasing: boolean = false;
  private _lastDrawX: number = 0;
  private _lastDrawY: number = 0;
  private _drawnCount: number = 0;
  public offsetX: number = 0;
  public offsetY: number = 0;

  @Output() public hoveredCoords = new EventEmitter<[number, number] | undefined>();
  @Output() public drawCount = new EventEmitter<number>();

  public zoom: number = 1;

  @Input() set settings(value: CanvasSettings) {
    this._settings.update(s => ({
      ...s,
      ...value,
    }));
  }

  @Input() set layers(value: Layer[]) {
    this._layers.set(value);
  }
  @Input() set canPaint(value: boolean) {
    this._canPaint.set(value);
  }

  private _ctx?: CanvasRenderingContext2D;
  @ViewChild('canvas', { static: true })
  public canvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true })
  public canvasContainer?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      this._settings();
      this._layers();
      this.drawPixels();
    });
  }

  public ngAfterViewInit(): void {
    this.drawPixels();
  }

  public get width() {
    return this._settings().width;
  }

  public get height() {
    return this._settings().height;
  }

  public gotWheel(event: WheelEvent) {
    if (event.deltaY < 0) {
      this.zoom *= 1.1;
    } else {
      this.zoom *= 0.9;
    }
    if (this.zoom < 1) {
      this.zoom = 1;
    } else if (this.zoom > 20) {
      this.zoom = 20;
    }
    this.fixOffsets();
    event.preventDefault();
  }

  public mouseMove(event: MouseEvent) {
    if (this._dragging) {
      this.offsetX += event.movementX / this.zoom;
      this.offsetY += event.movementY / this.zoom;
      this.fixOffsets();
      return;
    }

    if (this._drawing || this._erasing) {
      this.draw(event.offsetX, event.offsetY, this._erasing, false);
    }
    const { x, y } = this.getRealCoordinates(event.offsetX, event.offsetY);
    this.hoveredCoords.emit([x, y]);
  }

  private getRealCoordinates(offsetX: number, offsetY: number) {
    const x = Math.floor((offsetX / this.canvas!.nativeElement.clientWidth) * this.width);
    const y = Math.floor((offsetY / this.canvas!.nativeElement.clientHeight) * this.height);
    return { x, y };
  }

  private fixOffsets() {
    this._ctx?.save();
    const canvasWidth = this.canvas!.nativeElement.clientWidth;
    const actualCanvasWidth = canvasWidth * this.zoom;
    const maxOffsetX = (actualCanvasWidth - canvasWidth) / 2 / this.zoom;
    const canvasHeight = this.canvas!.nativeElement.clientHeight;
    const actualCanvasHeight = canvasHeight * this.zoom;
    const maxOffsetY = (actualCanvasHeight - canvasHeight) / 2 / this.zoom;
    if (this.offsetX > maxOffsetX) {
      this.offsetX = maxOffsetX;
    } else if (this.offsetX < -maxOffsetX) {
      this.offsetX = -maxOffsetX;
    }
    if (this.offsetY > maxOffsetY) {
      this.offsetY = maxOffsetY;
    } else if (this.offsetY < -maxOffsetY) {
      this.offsetY = -maxOffsetY;
    }
  }

  private drawCanvasPattern(ctx: CanvasRenderingContext2D) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = canvasPatternColor;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  private drawPixels() {
    if (!this.canvas || !this.canvasContainer) {
      throw new Error('Canvas or canvasContainer not initialized yet');
    }
    this._ctx = this.canvas.nativeElement.getContext('2d')!;
    this._ctx.fillStyle = '#ffffff';
    this._ctx.fillRect(0, 0, this.width, this.height);
    if (this._settings().canvasPattern) {
      this.drawCanvasPattern(this._ctx);
    }
    this.drawLayers(this._ctx);
    this._drawnCount =
      this._layers()[0]
        ?.pixels.flat()
        .filter(p => p).length ?? 0;
    this.drawCount.emit(this._drawnCount);
  }

  private drawLayers(ctx: CanvasRenderingContext2D) {
    for (const layer of this._layers()) {
      this.drawLayer(ctx, layer);
    }
  }

  private drawLayer(ctx: CanvasRenderingContext2D, layer: Layer) {
    ctx.fillStyle = layer.color;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (layer.pixels[x][y]) {
          ctx?.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  public mouseDown(event: MouseEvent) {
    this._dragging = event.button === 1;
    if (this._canPaint()) {
      this._drawing = event.button === 0;
      this._erasing = event.button === 2;
      if (this._drawing || this._erasing) {
        this.draw(event.offsetX, event.offsetY, this._erasing, true);
      }
    }
    event.preventDefault();
  }
  public mouseUp(event: MouseEvent) {
    this._dragging = false;
    this._drawing = false;
    this._erasing = false;
    event.preventDefault();
  }
  public mouseLeave() {
    this._dragging = false;
    this._drawing = false;
    this._erasing = false;
    this.hoveredCoords.emit(undefined);
  }

  private draw(rawX: number, rawY: number, erase: boolean, startPoint: boolean) {
    const { x, y } = this.getRealCoordinates(rawX, rawY);
    this._ctx?.restore();
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }

    this.drawPixel(x, y, erase);

    if (startPoint) {
      this._lastDrawX = x;
      this._lastDrawY = y;
      return;
    }
    const deltaX = x - this._lastDrawX;
    const deltaY = y - this._lastDrawY;

    const largerDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));

    for (let i = 0; i < largerDelta; i++) {
      const x_ = this._lastDrawX + Math.floor((deltaX / largerDelta) * i);
      const y_ = this._lastDrawY + Math.floor((deltaY / largerDelta) * i);
      this.drawPixel(x_, y_, erase);
    }
    this._lastDrawX = x;
    this._lastDrawY = y;
  }

  public get pixelsLeft() {
    const maxPixels = this._settings().maxPixels;
    if (!maxPixels) {
      return 1; // Creator can always paint
    }
    return maxPixels - this._drawnCount;
  }

  private drawPixel(x: number, y: number, erase: boolean) {
    const layers = this._layers();
    const drawLayer = layers[0];
    if (!erase && this.pixelsLeft <= 0) {
      // No more pixels left
      return;
    }
    if (layers.some((l, i) => i !== 0 && l.pixels[x][y])) {
      // We cannot draw on a pixel that is not part of the first layer
      return;
    }
    if (drawLayer.pixels[x][y] === !erase) {
      // Pixel is unchanged
      return;
    }

    drawLayer.pixels[x][y] = !erase;
    this._drawnCount += erase ? -1 : 1;
    this.drawCount.emit(this._drawnCount);

    if (erase) {
      if ((x + y) % 2 === 0) {
        this._ctx!.fillStyle = canvasPatternColor;
      } else {
        this._ctx!.fillStyle = '#ffffff';
      }
    } else {
      this._ctx!.fillStyle = 'black';
    }
    this._ctx?.fillRect(x, y, 1, 1);
  }
}
