import { Component } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';
import { BaseDialog } from '../../models/base-dialog.model';

@Component({
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent extends BaseDialog {
  private readonly _result = new Subject<
    { color: string; back: boolean; front: boolean; transparent: boolean; columns: number } | undefined
  >();
  public result = firstValueFrom(this._result.asObservable());
  public rejected = false;
  public color: string = '#FF0042';
  public transparent = false;
  public columns: string = '5';

  constructor() {
    super();
  }

  public submitBack() {
    this.submit(true);
  }

  public submitFront() {
    this.submit(false, true);
  }

  public submitImages() {
    this.submit();
  }

  public submit(back: boolean = false, front: boolean = false) {
    this._result.next({
      color: this.color,
      back,
      front,
      transparent: this.transparent,
      columns: Number.parseInt(this.columns, 10)
    });
    this._result.complete();
    this.close();
  }

  public get validInputs() {
    return this.color.match(/^#[0-9A-F]{6}$/i);
  }

  public cancel() {
    this._result.next(undefined);
    this._result.complete();
    this.close();
  }
}
