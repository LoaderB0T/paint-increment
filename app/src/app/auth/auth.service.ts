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
      enableDebugLogs: true,
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
    if (error.isSuperTokensGeneralError === true) {
      // this may be a custom error message sent from the API by you.
      console.error(error);
      // window.alert(error.message);
    } else {
      console.error(error);
    }
  }

  private handleThirdpartyCallback(response: Awaited<ReturnType<typeof signInAndUp>>) {
    if (response.status === 'OK') {
      const redirectTo = localStorage.getItem('returnUrl') || '/';
      this._router.navigate([redirectTo]);
    } else {
      this._router.navigate(['auth']);
    }
  }

  private handleThirdpartyCallbackError(error: any) {
    if (error.isSuperTokensGeneralError === true) {
      // this may be a custom error message sent from the API by you.
      console.error(error);
      // window.alert(error.message);
    } else {
      console.error(error);
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
