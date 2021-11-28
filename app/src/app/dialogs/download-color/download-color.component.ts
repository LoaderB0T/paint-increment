import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseDialog } from '../../models/base-dialog.model';

@Component({
  templateUrl: './download-color.component.html',
  styleUrls: ['./download-color.component.scss']
})
export class DownloadColorComponent extends BaseDialog {
  private readonly _result = new Subject<string>();
  public result = this._result.asObservable().toPromise();
  public rejected = false;
  public color: string = '#FF0042';

  constructor() {
    super();
  }

  public dismiss() {
    this._result.next(this.color);
    this._result.complete();
    this.close();
  }
}
