import { Injectable, signal } from '@angular/core';
import { UserInfo } from '../models/user-info.model';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class UserInfoService {
  private readonly _authService: AuthService;

  private _name: string;
  private _email: string;

  public loading = signal(true);

  constructor(authService: AuthService) {
    this._authService = authService;
    const userInfo = JSON.parse(localStorage.getItem('user-info') ?? '{}') as UserInfo;
    this._name = userInfo.name ?? '';
    this._email = userInfo.email ?? '';

    this.init();
  }

  private async init() {
    if (await this._authService.hasSession()) {
      const userInfo = await this._authService.getUserInfo();
      this._email = userInfo.email;
    }
    this.loading.set(false);
  }

  get name(): string {
    return this._name;
  }
  get email(): string {
    return this._email;
  }
  get initialized(): boolean {
    return this._name !== '' && this._email !== '';
  }

  set name(name: string) {
    this._name = name;
    this.save();
  }

  set email(email: string) {
    this._email = email;
    this.save();
  }

  private save() {
    localStorage.setItem('user-info', JSON.stringify({ name: this._name, email: this._email }));
  }
}
