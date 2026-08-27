import { afterNextRender, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import Session from 'supertokens-web-js/recipe/session';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  template: `@if (isAlreadyLoggedIn()) {
      Already signed in
    } @else {
      Please wait while we sign you in...
    }`,
})
export class AuthCallbackComponent {
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  protected readonly isAlreadyLoggedIn = signal(false);

  constructor() {
    afterNextRender(async () => {
      if (await Session.doesSessionExist()) {
        this.isAlreadyLoggedIn.set(true);
        this._router.navigate([localStorage.getItem('returnUrl') || '/']);
        return;
      }
      await this._authService.tryHandleThirdCallback();
    });
  }
}
