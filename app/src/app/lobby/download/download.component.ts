import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent, DialogService } from '@shared/controls';
import { injectI18n } from '@shared/i18n';
import { DownloadSettingsComponent } from 'src/app/dialog/download-settings/download-settings.component';

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
  protected readonly i18n = injectI18n();

  private readonly _settings = signal<DownloadSettings>({
    accentColor: '#00ff00',
    columnCount: 5,
    transparentBackground: true,
    renderYear: true,
    renderEdges: true,
  });

  protected goBackToHistory(): void {
    this._router.navigate(['../', 'history'], { relativeTo: this._activatedRoute });
  }

  protected openSettings(): void {
    const dialog = this._dialogService.showComponentDialog(DownloadSettingsComponent);
    dialog.componentRef.setInput('settings', this._settings());
    dialog.result.then(res => {
      if (res) {
        this._settings.set(res);
      }
    });
  }
}
