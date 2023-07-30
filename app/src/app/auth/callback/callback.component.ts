import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import Session from 'supertokens-web-js/recipe/session';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-container *ngIf="isAlreadyLoggedIn">Already signed in</ng-container>
    <ng-container *ngIf="!isAlreadyLoggedIn">Please wait while we sign you in...</ng-container>`,
  styleUrls: [],
})
export class AuthCallbackComponent implements OnInit {
  private readonly _route: ActivatedRoute;
  private readonly _authService: AuthService;
  public isAlreadyLoggedIn = false;

  constructor(route: ActivatedRoute, authService: AuthService) {
    this._route = route;
    this._authService = authService;
  }

  public async ngOnInit() {
    const isLoggedIn = await Session.doesSessionExist();
    if (isLoggedIn) {
      this.isAlreadyLoggedIn = true;
      return;
    }
    switch (this._route.snapshot.params.provider) {
      case 'google':
        return this._authService.handleGoogleCallback();
      default:
        throw new Error('Unknown provider');
    }
  }
}
