import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseDialog } from '../../models/base-dialog.model';

@Component({
  templateUrl: './no-mobile.component.html',
  styleUrls: ['./no-mobile.component.scss']
})
export class NoMobileComponent extends BaseDialog {
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
