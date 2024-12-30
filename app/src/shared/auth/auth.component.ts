import { Component, inject } from '@angular/core';
import { ButtonComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';

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
  protected readonly i18n = injectI18n();

  public google() {
    this._authService.initiateThirdpartySignIn('google');
  }
  public discord() {
    this._authService.initiateThirdpartySignIn('discord');
  }

  public back() {
    window.history.back();
  }
}
