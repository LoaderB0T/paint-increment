import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { urlArrayFromSegment } from '@shared/utils';
import Session from 'supertokens-web-js/recipe/session';

import { AuthService } from './auth.service';

export const isLoggedInGuard: CanActivateFn = async (next: ActivatedRouteSnapshot) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
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
