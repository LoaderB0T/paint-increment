import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

export abstract class DialogBase {
  public dialogId = Math.random().toString(36).slice(2);
  protected readonly $closeDialog = new Subject();
  public readonly closeDialog = this.$closeDialog.asObservable().pipe(map(() => this.dialogId));

  public close() {
    this.$closeDialog.next(undefined);
  }
}
