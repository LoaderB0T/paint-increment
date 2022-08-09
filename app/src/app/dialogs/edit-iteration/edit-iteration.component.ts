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
  public iterationId?: string;
  private _newIndex?: number;
  private _newName?: string;

  constructor() {
    super();
  }

  public get iteration(): IterationModel {
    if (!this.lobby) {
      throw new Error('Lobby not set');
    }
    if (this.iterationId === undefined) {
      throw new Error('Iteration index not set');
    }
    const iteration = this.lobby.pixelIterations.find(i => i.id === this.iterationId);
    if (!iteration) {
      throw new Error('Iteration not found');
    }
    return iteration;
  }

  public get newName(): string {
    this._newName ??= this.iteration.name;
    return this._newName;
  }
  public set newName(value: string) {
    this._newName = value;
  }
  public get newIndex(): string {
    this._newIndex ??= this.lobby?.pixelIterations.findIndex(i => i.id === this.iterationId);
    return String(this._newIndex ?? -1);
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
    this._result.next({ name: this.newName, index: this._newIndex ?? -1, delete: false });
    this._result.complete();
    this.close();
  }

  public remove() {
    this._result.next({ name: '', index: -1, delete: true });
    this._result.complete();
    this.close();
  }
}
