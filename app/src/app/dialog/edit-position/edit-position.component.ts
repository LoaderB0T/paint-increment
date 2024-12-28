import { ChangeDetectionStrategy, Component, inject, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyResponse } from '@shared/api';
import { ButtonComponent, DialogBase, TextboxComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';

import { IterationEditService } from '../../lobby/iteration-edit.service';

@Component({
  imports: [FormsModule, ButtonComponent, TextboxComponent],
  selector: 'awd-edit-position',
  templateUrl: 'edit-position.component.html',
  styleUrls: ['edit-position.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPositionComponent extends DialogBase {
  protected readonly i18n = injectI18n();
  protected readonly _router = inject(Router);
  protected readonly _iterationEditService = inject(IterationEditService);

  public readonly lobby = input.required<LobbyResponse>();
  public readonly iterationId = input.required<string>();
  public readonly activatedRoute = input.required<ActivatedRoute>();
  protected readonly lobbyIndex = linkedSignal(
    () => this.lobby().pixelIterations.findIndex(i => i.id === this.iterationId()) + 1
  );

  protected save() {
    const min = 1;
    const max = this.lobby().pixelIterations.length;
    if (this.lobbyIndex() < min || this.lobbyIndex() > max) {
      // TODO: Show error message
      return;
    }
    this._iterationEditService.changeIterationIndex(
      this.lobby(),
      this.iterationId(),
      this.lobbyIndex() - 1
    );
    this._router.navigate(['../', this.lobbyIndex() - 1], {
      relativeTo: this.activatedRoute(),
      replaceUrl: true,
    });
    this.close();
  }
}
