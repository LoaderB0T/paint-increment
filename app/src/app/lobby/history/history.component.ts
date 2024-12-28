import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyResponse } from '@shared/api';
import { ButtonComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';

import { CanvasComponent, CanvasSettings, getPixelArray, Layer } from '../canvas/canvas.component';

type CanvasData = {
  layers: Layer[];
  name: string;
};

@Component({
  imports: [CanvasComponent, ButtonComponent],
  selector: 'awd-history',
  templateUrl: 'history.component.html',
  styleUrls: ['history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent {
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);

  protected readonly i18n = injectI18n();
  protected readonly lobby = signal(
    this._activatedRoute.snapshot.parent?.data['lobby'] as LobbyResponse
  );
  protected readonly zoom = signal(0.7);
  protected readonly size = computed(() => 1000 * this.zoom());

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

  protected gotWheel(event: WheelEvent): void {
    if (event.shiftKey) {
      event.preventDefault();
      const delta = event.deltaY;
      if (delta > 0) {
        this.zoom.update(zoom => Math.max(0.1, zoom * 0.9));
      } else if (delta < 0) {
        this.zoom.update(zoom => Math.min(1, zoom * 1.1));
      }
    }
  }

  protected editIteration(index: number): void {}

  protected goBackToLobby(): void {
    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
  }
}
