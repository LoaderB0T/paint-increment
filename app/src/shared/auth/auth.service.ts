import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { isBrowser } from '@shared/utils';
import SuperTokens from 'supertokens-web-js';
import Session from 'supertokens-web-js/recipe/session';
import ThirdParty, {
  getAuthorisationURLWithQueryParamsAndSetState,
  signInAndUp,
} from 'supertokens-web-js/recipe/thirdparty';

import { AuthService as ApiAuthService } from '../api';
import { environment } from '../env';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isBrowser = isBrowser();
  private readonly _router = inject(Router);
  private readonly _apiService = inject(ApiAuthService);

  public init() {
    if (!this._isBrowser) {
      return;
    }
    SuperTokens.init({
      appInfo: {
        apiDomain: environment.apiUrl,
        apiBasePath: '/auth',
        appName: 'paint-increment',
      },
      recipeList: [Session.init(), ThirdParty.init()],
    });
  }

  public navigateToLogin(url?: string) {
    localStorage.setItem('returnUrl', url ?? '');
    this._router.navigate(['/auth/login']);
  }

  public async hasSession() {
    return await Session.doesSessionExist();
  }

  public async logout() {
    await Session.signOut();
    this._router.navigate(['/']);
  }

  public async getUserInfo() {
    const user = this._apiService.authControllerGetUserInfo();
    return user;
  }

  private handleThirdpartyInitiateError(error: any) {
    console.error('Error initiating thirdparty login');
    console.error(error);
    // Future improvement: show a toast message if error.isSuperTokensGeneralError === true
  }

  private handleThirdpartyCallbackError(error: any) {
    console.error('Error handling thirdparty login callback');
    console.error(error);
    // Future improvement: show a toast message if error.isSuperTokensGeneralError === true
  }

  private handleThirdpartyCallback(response: Awaited<ReturnType<typeof signInAndUp>>) {
    if (response.status === 'OK') {
      const redirectTo = localStorage.getItem('returnUrl') || '/';
      this._router.navigate([redirectTo]);
    } else {
      this._router.navigate(['auth']);
    }
  }

  public async initiateGoogleSignIn() {
    try {
      const authUrl = await getAuthorisationURLWithQueryParamsAndSetState({
        thirdPartyId: 'google',
        frontendRedirectURI: `${location.origin}/auth/callback/google`,
      });
      // we redirect the user to google for auth.
      window.location.assign(authUrl);
    } catch (err: any) {
      this.handleThirdpartyInitiateError(err);
    }
  }

  public async handleGoogleCallback() {
    try {
      const response = await signInAndUp();
      this.handleThirdpartyCallback(response);
    } catch (err: any) {
      this.handleThirdpartyCallbackError(err);
    }
  }
}
