import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, DialogBase, TextboxComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';

import { DownloadSettings } from './download-settings.model';

@Component({
  imports: [FormsModule, ButtonComponent, TextboxComponent],
  selector: 'awd-download-settings',
  templateUrl: 'download-settings.component.html',
  styleUrls: ['download-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadSettingsComponent extends DialogBase<DownloadSettings> {
  protected readonly i18n = injectI18n();

  public readonly settings = input.required<DownloadSettings>();

  protected readonly accentColor = linkedSignal(() => this.settings().accentColor);
  protected readonly columnCount = linkedSignal(() => this.settings().columnCount);
  protected readonly transparentBackground = linkedSignal(
    () => this.settings().transparentBackground
  );
  protected readonly renderYear = linkedSignal(() => this.settings().renderYear);
  protected readonly renderEdges = linkedSignal(() => this.settings().renderEdges);

  protected save() {
    this.close({
      accentColor: this.accentColor(),
      columnCount: this.columnCount(),
      transparentBackground: this.transparentBackground(),
      renderYear: this.renderYear(),
      renderEdges: this.renderEdges(),
    });
  }
}
