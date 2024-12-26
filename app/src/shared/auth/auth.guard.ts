import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { isBrowser, urlArrayFromSegment } from '@shared/utils';
import Session from 'supertokens-web-js/recipe/session';

import { AuthService } from './auth.service';

export const isLoggedInGuard: CanActivateFn = async (next: ActivatedRouteSnapshot) => {
  if (!isBrowser()) {
    return false;
  }
  const authService = inject(AuthService);
  const isLoggedIn = await Session.doesSessionExist();

  if (isLoggedIn) {
    return true;
  } else {
    authService.navigateToLogin(urlArrayFromSegment(next).join('/'));

    return false;
  }
};
