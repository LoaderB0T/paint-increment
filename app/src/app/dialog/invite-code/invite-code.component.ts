import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, DialogBase, TextboxComponent } from '@shared/controls';
import { TranslateService } from '@shared/i18n';

@Component({
  imports: [FormsModule, ButtonComponent, TextboxComponent],
  selector: 'awd-invite-code',
  templateUrl: 'invite-code.component.html',
  styleUrls: ['invite-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteCodeComponent extends DialogBase {
  protected readonly i18n = inject(TranslateService).translations;
  public newInviteCode = output<void>();
  protected readonly inviteCode = signal('');
  private readonly _codeTextBox = viewChild.required('codeTextBox', { read: ElementRef });

  private get inputElement() {
    return this._codeTextBox().nativeElement.querySelector('input') as HTMLInputElement;
  }

  public setCode(code: string, doCopy = false) {
    this.inviteCode.set(code);
    if (doCopy) {
      setTimeout(() => {
        this.doCopy();
      });
    }
  }

  protected copy(): void {
    this.doCopy();
  }

  private doCopy() {
    this.inputElement.focus();
    this.inputElement.setSelectionRange(0, this.inputElement.value.length);
    document.execCommand('copy');
  }
}
