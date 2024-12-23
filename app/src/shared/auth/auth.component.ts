import { Component, inject } from '@angular/core';
import { ButtonComponent } from '@shared/controls/button/button.component';
import { TranslateService } from '@shared/i18n/translate.service';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  private readonly _authService = inject(AuthService);
  protected readonly i18n = inject(TranslateService).translations;

  public google() {
    this._authService.initiateGoogleSignIn();
  }

  public back() {
    window.history.back();
  }
}
