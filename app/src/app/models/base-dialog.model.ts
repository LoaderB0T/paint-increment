import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

export abstract class BaseDialog {
  public dialogId: string;
  protected $closeDialog = new Subject();
  public closeDialog = this.$closeDialog.asObservable().pipe(map(() => this.dialogId));

  constructor() {
    this.dialogId = Math.random().toString(36).slice(2);
  }

  public close() {
    this.$closeDialog.next();
  }
}
