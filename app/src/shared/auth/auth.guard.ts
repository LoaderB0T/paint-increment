import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import Session from 'supertokens-web-js/recipe/session';

import { AuthService } from './auth.service';

export const isLoggedInGuard: CanActivateFn = async (next: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const isLoggedIn = await Session.doesSessionExist();

  if (isLoggedIn) {
    return true;
  } else {
    authService.navigateToLogin(next.url.map(x => x.path).join('/'));

    return false;
  }
};
