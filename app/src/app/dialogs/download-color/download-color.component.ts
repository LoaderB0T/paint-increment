import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseDialog } from '../../models/base-dialog.model';

@Component({
  templateUrl: './download-color.component.html',
  styleUrls: ['./download-color.component.scss']
})
export class DownloadColorComponent extends BaseDialog {
  private readonly _result = new Subject<{ color: string; canvas: boolean }>();
  public result = this._result.asObservable().toPromise();
  public rejected = false;
  public color: string = '#FF0042';

  constructor() {
    super();
  }

  public submitCanvas() {
    this.submit(true);
  }

  public submitImages() {
    this.submit(false);
  }

  public submit(canvas: boolean) {
    this._result.next({ color: this.color, canvas });
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
