import { Component, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { TextboxComponent } from '../../controls/textbox/textbox.component';
import { BaseDialog } from '../../models/base-dialog.model';

@Component({
  templateUrl: './invite-code.component.html',
  styleUrls: ['./invite-code.component.scss']
})
export class InviteCodeComponent extends BaseDialog {
  public copyText: string = 'Loading...';
  public isCopySuccess = false;
  public newCode = false;
  public newInviteCode = new EventEmitter<void>();

  @ViewChild('copyInput') copyInput!: TextboxComponent;
  @ViewChild('copyButton') copyButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('newButton') newButton!: ElementRef<HTMLButtonElement>;

  constructor() {
    super();
  }

  public setCopyText(text: string, copyText: boolean = false) {
    this.copyText = text;
    if (copyText) {
      setTimeout(() => {
        this.doCopy(this.newButton.nativeElement);
        this.newCode = true;
        setTimeout(() => {
          this.newCode = false;
        }, 600);
      });
    }
  }

  private get inputElement() {
    return this.copyInput['inputElement']!.nativeElement;
  }

  public inputClicked(): void {
    this.inputElement.setSelectionRange(0, this.inputElement.value.length);
  }

  private doCopy(usedButton: HTMLButtonElement) {
    this.inputElement.focus();
    this.inputElement.setSelectionRange(0, this.inputElement.value.length);
    document.execCommand('copy');
    usedButton.focus();
  }

  public copy(): void {
    this.doCopy(this.copyButton.nativeElement);
    this.isCopySuccess = true;
    setTimeout(() => {
      this.isCopySuccess = false;
    }, 600);
  }

  public generateNewInviteCode(): void {
    this.copyText = 'Loading...';
    this.newInviteCode.emit();
  }
}
