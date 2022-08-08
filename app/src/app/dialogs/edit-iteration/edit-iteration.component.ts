import { Component } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';
import { IterationModel } from '../../.api/models/iteration-model';
import { LobbyResponse } from '../../.api/models/lobby-response';
import { BaseDialog } from '../../models/base-dialog.model';

@Component({
  templateUrl: './edit-iteration.component.html',
  styleUrls: ['./edit-iteration.component.scss']
})
export class EditIterationComponent extends BaseDialog {
  private readonly _result = new Subject<void>();
  public result = firstValueFrom(this._result);
  public lobby?: LobbyResponse;
  public iterationIndex?: number;

  constructor() {
    super();
  }

  public get iteration(): IterationModel {
    if (!this.lobby) {
      throw new Error('Lobby not set');
    }
    if (!this.iterationIndex) {
      throw new Error('Iteration index not set');
    }
    const iteration = this.lobby.pixelIterations[this.iterationIndex];
    if (!iteration) {
      throw new Error('Iteration not found');
    }
    return iteration;
  }

  public dismiss() {
    this._result.next();
    this._result.complete();
    this.close();
  }
}
