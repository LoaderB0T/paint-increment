import { Component, EventEmitter } from '@angular/core';
import { BaseDialog } from '../../models/base-dialog.model';

@Component({
  templateUrl: './time-up.component.html',
  styleUrls: ['./time-up.component.scss']
})
export class TimeUpComponent extends BaseDialog {
  public gracePeriodTimeLeft: number = 30;
  public upload = new EventEmitter<void>();
  public discard = new EventEmitter<void>();

  constructor() {
    super();
  }

  public discardBtn() {
    this.discard.emit();
  }

  public uploadBtn() {
    this.upload.emit();
  }
}
