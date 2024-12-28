import { ChangeDetectionStrategy, Component, inject, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LobbyResponse } from '@shared/api';
import { ButtonComponent, DialogBase, TextboxComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';

import { IterationEditService } from '../../lobby/iteration-edit.service';

@Component({
  imports: [FormsModule, ButtonComponent, TextboxComponent],
  selector: 'awd-edit-name',
  templateUrl: 'edit-name.component.html',
  styleUrls: ['edit-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditNameComponent extends DialogBase {
  protected readonly i18n = injectI18n();
  protected readonly _iterationEditService = inject(IterationEditService);

  public readonly lobby = input.required<LobbyResponse>();
  public readonly iterationId = input.required<string>();
  protected readonly lobbyName = linkedSignal(
    () => this.lobby().pixelIterations.find(i => i.id === this.iterationId())?.name ?? ''
  );

  protected save() {
    this._iterationEditService.changeIterationName(
      this.lobby(),
      this.iterationId(),
      this.lobbyName()
    );
    this.close();
  }
}
