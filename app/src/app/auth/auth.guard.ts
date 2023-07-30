import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import Session from 'supertokens-web-js/recipe/session';

export const isLoggedInGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const isLoggedIn = await Session.doesSessionExist();

  if (isLoggedIn) {
    return true;
  } else {
    const returnUrl = state.url;
    localStorage.setItem('returnUrl', returnUrl);
    router.navigate(['/auth']);
    return false;
  }
};
