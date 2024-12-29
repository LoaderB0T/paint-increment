import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyResponse } from '@shared/api';
import { ButtonComponent, DialogService } from '@shared/controls';
import { injectI18n } from '@shared/i18n';
import { StorageService } from '@shared/shared/storage';
import { throwExp } from '@shared/utils';
import { DownloadSettingsComponent } from 'src/app/dialog/download-settings/download-settings.component';

import { renderBack } from './rendering/back';
import { renderFront } from './rendering/front';
import { DownloadSettings } from '../../dialog/download-settings/download-settings.model';

@Component({
  imports: [ButtonComponent],
  selector: 'awd-download',
  templateUrl: 'download.component.html',
  styleUrls: ['download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadComponent {
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _dialogService = inject(DialogService);
  private readonly _document = inject(DOCUMENT);
  private readonly _lobby = this._activatedRoute.snapshot.parent?.data['lobby'] as LobbyResponse;
  protected readonly i18n = injectI18n();

  protected readonly canvasSize = signal({ width: 0, height: 0 });
  protected readonly frontSide = signal(true);
  private readonly _canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly _settings = inject(StorageService).init<DownloadSettings>('download-settings', {
    accentColor: '#00ff00',
    columnCount: 5,
    transparentBackground: true,
    renderYear: true,
    renderEdges: true,
  });

  constructor() {
    afterRenderEffect(() => {
      this._settings.valueSig();
      this.frontSide();
      this.refreshPreview();
    });
  }

  protected goBackToHistory(): void {
    this._router.navigate(['../', 'history'], { relativeTo: this._activatedRoute });
  }

  protected openSettings(): void {
    const dialog = this._dialogService.showComponentDialog(DownloadSettingsComponent);
    dialog.componentRef.setInput('settings', this._settings.forceValue);
    dialog.result.then(res => {
      if (res) {
        this._settings.value = res;
      }
    });
  }

  protected flip() {
    this.frontSide.update(d => !d);
  }

  private refreshPreview() {
    if (this.frontSide()) {
      renderFront(this._lobby, this._settings.forceValue, this._document).then(canvas => {
        const ctx =
          this._canvas().nativeElement.getContext('2d') ?? throwExp('Canvas not supported');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.canvasSize.set({ width: canvas.width, height: canvas.height });
        setTimeout(() => {
          ctx.drawImage(canvas, 0, 0);
        });
      });
    } else {
      renderBack(this._lobby, this._settings.forceValue, this._document).then(canvas => {
        const ctx =
          this._canvas().nativeElement.getContext('2d') ?? throwExp('Canvas not supported');
        this.canvasSize.set({ width: canvas.width, height: canvas.height });
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setTimeout(() => {
          ctx.drawImage(canvas, 0, 0);
        });
      });
    }
  }
}
