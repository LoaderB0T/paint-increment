import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseDialog } from '../../models/base-dialog.model';

@Component({
  templateUrl: './confirmed-or-rejected.component.html',
  styleUrls: ['./confirmed-or-rejected.component.scss']
})
export class ConfirmedOrRejectedComponent extends BaseDialog {
  private readonly _result = new Subject<void>();
  public result = this._result.asObservable().toPromise();
  public rejected = false;

  constructor() {
    super();
  }

  public dismiss() {
    this._result.next();
    this._result.complete();
    this.close();
  }
}
