import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, firstValueFrom } from 'rxjs';
import { BaseDialog } from '../../models/base-dialog.model';
import { AuthService } from '../../auth/auth.service';
import { UserInfoService } from '../../services/user-info.service';

@Component({
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoComponent extends BaseDialog {
  private readonly _authService: AuthService;
  private readonly _userInfoService: UserInfoService;

  private readonly _result = new Subject<boolean>();
  public result = firstValueFrom(this._result);
  public readonly hasSession = signal(false);
  public canDoLater: boolean = true;

  public name: string = '';
  public email: string = '';

  constructor(authService: AuthService, userInfoService: UserInfoService) {
    super();
    this._authService = authService;
    this._userInfoService = userInfoService;
    authService.hasSession().then(hasSession => {
      if (hasSession) {
        this.hasSession.set(true);
      }
    });

    this.name = userInfoService.name;
    this.email = userInfoService.email;
  }

  public get validInputs() {
    return (
      this.name.length > 0 &&
      this.email.length > 0 &&
      this.email.includes('@') &&
      this.email.includes('.')
    );
  }

  public login() {
    this._authService.navigateToLogin();
    this.close();
  }

  public logout() {
    this._authService.logout();
    this.close();
  }

  public cancel() {
    this._result.next(false);
    this._result.complete();
    this.close();
  }

  public submit() {
    this._userInfoService.name = this.name;
    this._userInfoService.email = this.email;

    this._result.next(true);
    this._result.complete();

    this.close();
  }
}
