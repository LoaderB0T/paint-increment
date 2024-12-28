import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Hammer, throwExp } from '@shared/utils';

export type Layer = {
  color: string;
  pixels: boolean[][];
};

export type CanvasSettings = {
  width: number;
  height: number;
  canvasPattern: boolean;
  maxPixels: number;
};

const canvasPatternColor = '#e3e3e3';

export function getPixelArray(width: number, height: number): boolean[][] {
  return Array.from({ length: width }, () => Array.from({ length: height }, () => false));
}

@Component({
  selector: 'awd-canvas',
  templateUrl: 'canvas.component.html',
  styleUrls: ['canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasComponent {
  private readonly _recentDraws = new Array<{ x: number; y: number; erase: boolean }>();
  private readonly _canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly _canvasContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('canvasContainer');

  private readonly _ctx = computed(
    () => this._canvas().nativeElement.getContext('2d') ?? throwExp('No 2d context')
  );
  protected readonly zoom = signal(1);
  protected readonly offsetX = signal(0);
  protected readonly offsetY = signal(0);
  public readonly isHistory = input(false);
  public readonly settings = input.required<Required<CanvasSettings>>();
  private _dragging: boolean = false;
  private _drawing: boolean = false;
  private _erasing: boolean = false;
  private _lastDrawX: number = 0;
  private _lastDrawY: number = 0;
  private _drawnCount: number = 0;

  public readonly isEditMode = input<boolean>(false);
  public readonly fixedSize = input<number>(0);
  public readonly allowPaint = input<boolean>(true);
  public readonly layers = input.required<Layer[]>();
  public readonly hoveredCoords = output<{ x: number; y: number } | undefined>();
  public readonly drawCount = output<number>();
  public readonly changed = output<void>();
  private _isPinching: boolean = false;
  private _disableDraw: boolean = false;

  private get _pixelsLeft() {
    const maxPixels = this.settings().maxPixels;
    if (!maxPixels) {
      return 1; // Creator can always paint
    }
    return maxPixels - this._drawnCount;
  }

  constructor() {
    afterRenderEffect(() => {
      this.layers(); // Trigger computed
      untracked(() => this.drawPixels());
    });

    afterRenderEffect(() => {
      if (this.fixedSize()) {
        this._canvas().nativeElement.style.width = `${this.fixedSize()}px`;
        this._canvas().nativeElement.style.height = `${this.fixedSize()}px`;
        return;
      }
      const container = this._canvasContainer().nativeElement;
      const resize = new ResizeObserver(() => {
        const bounds = container.getBoundingClientRect();
        const { width, height } = bounds;
        const min = Math.min(width, height);
        this._canvas().nativeElement.style.width = `${min}px`;
        this._canvas().nativeElement.style.height = `${min}px`;
      });
      resize.observe(container);
    });

    afterRenderEffect(() => {
      if (this.isHistory()) {
        return;
      }
      const canvas = this._canvas().nativeElement;
      if (Hammer) {
        let pinchZoomStart = 1;
        let pinchOffsetX = 0;
        let pinchOffsetY = 0;
        const hammertime = new Hammer(canvas, {});
        hammertime.get('pinch').set({ enable: true });
        hammertime.on('pinch', ev => {
          this._isPinching = true;
          this._disableDraw = true;
          const newScale = pinchZoomStart * ev.scale;
          const clampedScale = Math.min(20, Math.max(1, newScale));
          this.zoom.set(clampedScale);
          this.offsetX.set(this.ensureOffsetWithinRangeX(pinchOffsetX + ev.deltaX / this.zoom()));
          this.offsetY.set(this.ensureOffsetWithinRangeY(pinchOffsetY + ev.deltaY / this.zoom()));
        });
        hammertime.on('pinchend', () => {
          this._isPinching = false;
          pinchZoomStart = this.zoom();
          pinchOffsetX = this.offsetX();
          pinchOffsetY = this.offsetY();
        });
      }
    });
  }

  private getRealCoordinates(offsetX: number, offsetY: number) {
    const x = Math.floor(
      (offsetX / this._canvas().nativeElement.clientWidth) * this.settings().width
    );
    const y = Math.floor(
      (offsetY / this._canvas().nativeElement.clientHeight) * this.settings().height
    );
    return { x, y };
  }

  protected gotWheel(event: WheelEvent) {
    if (this.isHistory()) {
      return;
    }
    if (event.deltaY < 0) {
      this.zoom.update(z => {
        const newZoom = z * 1.1;
        if (newZoom > 20) {
          return 20;
        }
        return newZoom;
      });
    } else {
      this.zoom.update(z => {
        const newZoom = z / 1.1;
        if (newZoom < 1) {
          return 1;
        }
        return newZoom;
      });
    }
    this.offsetX.update(old => this.ensureOffsetWithinRangeX(old));
    this.offsetY.update(old => this.ensureOffsetWithinRangeY(old));
    event.preventDefault();
  }

  private ensureOffsetWithinRangeX(newVal: number) {
    const canvasWidth = this._canvas().nativeElement.clientWidth;
    const actualCanvasWidth = canvasWidth * this.zoom();
    const maxOffsetX = (actualCanvasWidth - canvasWidth) / 2 / this.zoom();
    if (newVal > maxOffsetX) {
      return maxOffsetX;
    } else if (newVal < -maxOffsetX) {
      return -maxOffsetX;
    }
    return newVal;
  }

  private ensureOffsetWithinRangeY(newVal: number) {
    const canvasHeight = this._canvas().nativeElement.clientHeight;
    const actualCanvasHeight = canvasHeight * this.zoom();
    const maxOffsetY = (actualCanvasHeight - canvasHeight) / 2 / this.zoom();
    if (newVal > maxOffsetY) {
      return maxOffsetY;
    } else if (newVal < -maxOffsetY) {
      return -maxOffsetY;
    }
    return newVal;
  }

  protected mouseMove(event: MouseEvent) {
    if (this._dragging) {
      this.offsetX.update(old =>
        this.ensureOffsetWithinRangeX(old + event.movementX / this.zoom())
      );
      this.offsetY.update(old =>
        this.ensureOffsetWithinRangeY(old + event.movementY / this.zoom())
      );
      return;
    }

    if (this._drawing || this._erasing) {
      this.draw(event.offsetX, event.offsetY, this._erasing, false);
    }
    const { x, y } = this.getRealCoordinates(event.offsetX, event.offsetY);
    this.hoveredCoords.emit({ x, y });
  }

  protected mouseDown(event: PointerEvent) {
    console.log(event);
    this._dragging = event.button === 1;
    if (this.allowPaint()) {
      // If the first pointer is pressed, reset the recent draws
      if (event.isPrimary) {
        this._recentDraws.length = 0;
      } else {
        // If the second pointer is pressed, undo the recent draws
        this._recentDraws.forEach(recentDraw => {
          this.drawPixel(recentDraw.x, recentDraw.y, !recentDraw.erase);
        });
      }

      this._drawing = event.button === 0;
      this._erasing = event.button === 2;
      if (this._drawing || this._erasing) {
        this.draw(event.offsetX, event.offsetY, this._erasing, true);
      }
      event.preventDefault();
    }
  }

  protected mouseUp(event: MouseEvent) {
    this._dragging = false;
    this._drawing = false;
    this._erasing = false;

    if (!event.buttons) {
      setTimeout(() => {
        this._disableDraw = false;
      }, 10);
    }

    event.preventDefault();
  }
  protected mouseLeave() {
    this._dragging = false;
    this._drawing = false;
    this._erasing = false;
    this.hoveredCoords.emit(undefined);
  }

  private draw(rawX: number, rawY: number, erase: boolean, startPoint: boolean) {
    const { x, y } = this.getRealCoordinates(rawX, rawY);
    this._ctx().restore();
    if (x < 0 || y < 0 || x >= this.settings().width || y >= this.settings().height) {
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
      setTimeout(() => {
        this.drawPixel(x_, y_, erase);
      });
    }
    this._lastDrawX = x;
    this._lastDrawY = y;
  }

  private drawLayers() {
    const layers = [...this.layers()].reverse();
    for (const layer of layers) {
      this.drawLayer(layer);
    }
  }

  private drawLayer(layer: Layer) {
    this._ctx().fillStyle = layer.color;
    for (let x = 0; x < this.settings().width; x++) {
      for (let y = 0; y < this.settings().height; y++) {
        if (layer.pixels[x][y]) {
          this._ctx().fillRect(x, y, 1, 1);
        }
      }
    }
  }

  private drawCanvasPattern() {
    for (let x = 0; x < this.settings().width; x++) {
      for (let y = 0; y < this.settings().height; y++) {
        if ((x + y) % 2 === 0) {
          this._ctx().fillStyle = canvasPatternColor;
          this._ctx().fillRect(x, y, 1, 1);
        }
      }
    }
  }

  private drawPixels() {
    if (!this._canvas() || !this._canvasContainer()) {
      throw new Error('Canvas or canvasContainer not initialized yet');
    }
    this._ctx().fillStyle = '#ffffff';
    this._ctx().fillRect(0, 0, this.settings().width, this.settings().height);
    if (this.settings().canvasPattern) {
      this.drawCanvasPattern();
    }
    this.drawLayers();
    this._drawnCount =
      this.layers()[0]
        ?.pixels.flat()
        .filter(p => p).length ?? 0;
    this.drawCount.emit(this._drawnCount);
  }

  private drawPixel(x: number, y: number, erase: boolean) {
    if (this._isPinching || this._disableDraw) {
      return;
    }
    const layers = this.layers();
    const drawLayer = layers[0];
    if (!erase && this._pixelsLeft <= 0) {
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
    this._recentDraws.push({ x, y, erase });
    drawLayer.pixels[x][y] = !erase;
    this._drawnCount += erase ? -1 : 1;
    this.drawCount.emit(this._drawnCount);
    this.changed.emit();

    if (erase) {
      if ((x + y) % 2 === 0 && this.settings().canvasPattern) {
        this._ctx().fillStyle = canvasPatternColor;
      } else {
        this._ctx().fillStyle = '#ffffff';
      }
    } else {
      this._ctx().fillStyle = this.isEditMode() ? '#FF0042' : 'black';
    }
    this._ctx().fillRect(x, y, 1, 1);
  }
}
