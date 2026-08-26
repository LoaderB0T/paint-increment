
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import Session from 'supertokens-web-js/recipe/session';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  imports: [],
  template: `@if (isAlreadyLoggedIn) {
  Already signed in
}
@if (!isAlreadyLoggedIn) {
  Please wait while we sign you in...
}`,
  styleUrls: [],
})
export class AuthCallbackComponent implements OnInit {
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  public isAlreadyLoggedIn = false;

  public async ngOnInit() {
    const isLoggedIn = await Session.doesSessionExist();
    if (isLoggedIn) {
      const redirectTo = localStorage.getItem('returnUrl') || '/';
      this._router.navigate([redirectTo]);
      return;
    }
    return this._authService.tryHandleThirdCallback();
  }
}
