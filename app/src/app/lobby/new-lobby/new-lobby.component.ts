import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '@shared/controls/button/button.component';
import { TextboxComponent } from '@shared/controls/textbox/textbox.component';
import { TranslateService } from '@shared/i18n/translate.service';
import { objectKeys } from '@shared/utils';

@Component({
  selector: 'awd-new-lobby',
  imports: [ReactiveFormsModule, TextboxComponent, ButtonComponent],
  templateUrl: 'new-lobby.component.html',
  styleUrls: ['new-lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewLobbyComponent {
  private readonly _router = inject(Router);
  protected readonly i18n = inject(TranslateService).translations;
  constructor() {}

  protected readonly form = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]),
    maxPixels: new FormControl(250, [
      Validators.required,
      Validators.min(1),
      Validators.max(99999),
    ]),
    size: new FormControl(100, [Validators.required, Validators.min(50), Validators.max(200)]),
    timeLimit: new FormControl(15, [Validators.required, Validators.min(1), Validators.max(60)]),
  });

  protected createLobby() {
    const objKeys = objectKeys(this.form.controls);
    objKeys.forEach(key => {
      this.form.controls[key].markAsTouched();
    });
    if (this.form.invalid) {
      return;
    }
    this.form.disable();
    this._router.navigate(['/lobby', '1234']);
  }

  protected goToHome(): void {
    this._router.navigate(['/']);
  }
}
