import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyResponse } from '@shared/api';
import { ButtonComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';

import { CanvasComponent, CanvasSettings, getPixelArray, Layer } from '../canvas/canvas.component';

type CanvasData = {
  layers: Layer[];
  name: string;
};

const flexGap = 16;

@Component({
  imports: [CanvasComponent, ButtonComponent],
  selector: 'awd-history',
  templateUrl: 'history.component.html',
  styleUrls: ['history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent implements AfterViewInit {
  private readonly _document = inject(DOCUMENT);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _content = viewChild.required<ElementRef<HTMLDivElement>>('content');

  protected readonly flexGap = `${flexGap}px`;
  protected readonly i18n = injectI18n();
  protected readonly lobby = signal(
    this._activatedRoute.snapshot.parent?.data['lobby'] as LobbyResponse
  );
  private readonly _maxWidth = signal(0);
  protected readonly zoom = signal(0.5);
  protected readonly size = computed(() => this._maxWidth() * this.zoom() - flexGap);

  protected readonly settings = computed<CanvasSettings>(() => ({
    canvasPattern: false,
    height: this.lobby().settings.height,
    width: this.lobby().settings.width,
    maxPixels: this.lobby().settings.maxPixels,
  }));

  protected readonly canvasses = computed(() => {
    const iterations = this.lobby().pixelIterations;
    const canvasses: CanvasData[] = [];
    for (let i = 0; i < iterations.length; i++) {
      const previousIterations = iterations.slice(0, i);
      const currentIteration = iterations[i];

      const prevLayer: Layer = {
        color: '#000000',
        pixels: getPixelArray(this.lobby().settings.width, this.lobby().settings.height),
      };
      const currentLayer: Layer = {
        color: '#FF0042',
        pixels: getPixelArray(this.lobby().settings.width, this.lobby().settings.height),
      };

      previousIterations.forEach(iteration => {
        iteration.pixels.forEach(pixel => {
          prevLayer.pixels[pixel.x][pixel.y] = true;
        });
      });
      currentIteration.pixels.forEach(pixel => {
        currentLayer.pixels[pixel.x][pixel.y] = true;
      });
      canvasses.push({ layers: [currentLayer, prevLayer], name: currentIteration.name });
    }
    return canvasses;
  });

  constructor() {
    afterRenderEffect(() => {
      const el = this._content().nativeElement;
      const resizeObserver = new ResizeObserver(() => {
        this._maxWidth.set(el.clientWidth);
      });
      resizeObserver.observe(el);
    });
  }

  public ngAfterViewInit(): void {
    if (this._document.body.clientWidth < 400) {
      this.zoom.set(1);
    }
  }

  protected gotWheel(event: WheelEvent): void {
    if (event.shiftKey) {
      event.preventDefault();
      const delta = event.deltaY;
      if (delta > 0) {
        this.zoom.update(zoom => Math.max(0.25, zoom * 0.9));
      } else if (delta < 0) {
        this.zoom.update(zoom => Math.min(1, zoom * 1.1));
      }
    }
  }

  protected editIteration(index: number): void {
    this._router.navigate(['edit', index], { relativeTo: this._activatedRoute });
  }

  protected goBackToLobby(): void {
    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
  }

  protected goToDownload(): void {
    this._router.navigate(['../', 'download'], { relativeTo: this._activatedRoute });
  }
}
