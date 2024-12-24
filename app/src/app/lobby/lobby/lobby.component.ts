import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyResponse } from '@shared/api';
import { ButtonComponent } from '@shared/controls/button/button.component';
import { TranslateService } from '@shared/i18n/translate.service';

import { CanvasComponent, CanvasSettings, Layer } from '../canvas/canvas.component';

function getPixelArray(width: number, height: number): boolean[][] {
  return Array.from({ length: width }, () => Array.from({ length: height }, () => false));
}

@Component({
  imports: [ButtonComponent, CanvasComponent],
  selector: 'awd-lobby',
  templateUrl: 'lobby.component.html',
  styleUrls: ['lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyComponent {
  private readonly _router = inject(Router);
  protected readonly i18n = inject(TranslateService).translations;
  protected readonly lobby = inject(ActivatedRoute).snapshot.data['lobby'] as LobbyResponse;

  protected readonly settings: CanvasSettings = {
    canvasPattern: false,
    height: this.lobby.settings.height,
    width: this.lobby.settings.width,
    maxPixels: this.lobby.settings.maxPixels + 999,
  };
  protected readonly committedLayer: Layer = {
    color: '#000000',
    pixels: getPixelArray(this.settings.width, this.settings.height),
  };
  protected readonly layers = computed(() => [this.committedLayer]);

  constructor() {
    this.lobby.pixelIterations
      .filter(x => x.confirmed)
      .forEach(i => {
        i.pixels.forEach(ip => {
          this.committedLayer.pixels[ip.x][ip.y] = true;
        });
      });
  }

  public navigateHome(): void {
    this._router.navigate(['/']);
  }
}
