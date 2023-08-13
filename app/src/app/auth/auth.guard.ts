import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import Session from 'supertokens-web-js/recipe/session';
import { AuthService } from './auth.service';

export const isLoggedInGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const isLoggedIn = await Session.doesSessionExist();

  if (isLoggedIn) {
    return true;
  } else {
    authService.navigateToLogin();

    return false;
  }
};
