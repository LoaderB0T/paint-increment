import SuperTokens from 'supertokens-web-js';
import Session from 'supertokens-web-js/recipe/session';
import ThirdParty, {
  getAuthorisationURLWithQueryParamsAndSetState,
  signInAndUp,
} from 'supertokens-web-js/recipe/thirdparty';

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ApiService } from '../.api/services/api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _router: Router;
  private readonly _apiService: ApiService;

  constructor(router: Router, apiService: ApiService) {
    this._router = router;
    this._apiService = apiService;
  }

  public init() {
    SuperTokens.init({
      appInfo: {
        apiDomain: environment.apiUrl,
        apiBasePath: '/auth',
        appName: 'paint-increment',
      },
      recipeList: [Session.init(), ThirdParty.init()],
    });
  }

  public navigateToLogin() {
    const returnUrl = this._router.url;
    localStorage.setItem('returnUrl', returnUrl);
    this._router.navigate(['/auth']);
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
