import { afterNextRender, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';
import Session from 'supertokens-web-js/recipe/session';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  imports: [LoadingComponent],
  template: `<div class="callback">
    <awd-loading label="" />
    <p role="status">
      {{ isAlreadyLoggedIn() ? i18n.auth_callback_alreadySignedIn() : i18n.auth_callback_signingIn() }}
    </p>
  </div>`,
  styles: `
    .callback {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class AuthCallbackComponent {
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  protected readonly i18n = injectI18n();
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
