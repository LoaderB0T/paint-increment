import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseDialog } from '../../models/base-dialog.model';

@Component({
  templateUrl: './increment-details.component.html',
  styleUrls: ['./increment-details.component.scss']
})
export class IncrementDetailsComponent extends BaseDialog {
  private readonly _result = new Subject<boolean>();
  public result = this._result.asObservable().toPromise();

  public name: string = '';
  public email: string = '';

  constructor() {
    super();
  }

  public get validInputs() {
    return this.name.length > 0 && this.email.length > 0 && this.email.includes('@') && this.email.includes('.');
  }

  public cancel() {
    this._result.next(false);
    this._result.complete();
    this.close();
  }

  public submit() {
    this._result.next(true);
    this._result.complete();
    this.close();
  }
}
