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
  private readonly _result = new Subject<{ name: string; index: number; delete: boolean } | undefined>();
  public result = firstValueFrom(this._result);
  public lobby?: LobbyResponse;
  public iterationIndex?: number;
  private _newIndex?: number;

  constructor() {
    super();
  }

  public get iteration(): IterationModel {
    if (!this.lobby) {
      throw new Error('Lobby not set');
    }
    if (this.iterationIndex === undefined) {
      throw new Error('Iteration index not set');
    }
    const iteration = this.lobby.pixelIterations[this.iterationIndex];
    if (!iteration) {
      throw new Error('Iteration not found');
    }
    return iteration;
  }

  public get newName(): string {
    return this.iteration.name;
  }
  public set newName(value: string) {
    this.iteration.name = value;
  }
  public get newIndex(): string {
    this._newIndex ??= this.iterationIndex ?? -1;
    return String(this._newIndex);
  }
  public set newIndex(value: string) {
    this._newIndex = Number.parseInt(value, 10);
  }

  public dismiss() {
    this._result.next(undefined);
    this._result.complete();
    this.close();
  }

  public save() {
    this._result.next({ name: this.iteration.name, index: this._newIndex ?? this.iterationIndex ?? -1, delete: false });
    this._result.complete();
    this.close();
  }
}
