import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '@shared/auth';
import { assertBody, isBrowser } from '@shared/utils';

import { UserInfo } from './user-info.model';
import { StorageService } from '../storage';

@Injectable({ providedIn: 'root' })
export class UserInfoService {
  private readonly _authService = inject(AuthService);
  private readonly _store = inject(StorageService).init<UserInfo>('user-info', {
    name: '',
    email: '',
  });
  private readonly _isBrowser = isBrowser();

  public readonly loading = signal(true);

  public async init() {
    if (this._isBrowser && (await this._authService.hasSession())) {
      const response = await this._authService.getUserInfo();
      if (!response.ok) {
        return;
      }
      const userInfo = assertBody(response);
      this._store.update(info => {
        info.email = userInfo.email;
        return info;
      });
    }
    this.loading.set(false);
  }

  get name(): string {
    return this._store.value?.name ?? '';
  }
  get email(): string {
    return this._store.value?.email ?? '';
  }
  get initialized(): boolean {
    return this.name !== '' && this.email !== '';
  }

  set name(name: string) {
    this._store.update(info => {
      info.name = name;
      return info;
    });
  }

  set email(email: string) {
    this._store.update(info => {
      info.email = email;
      return info;
    });
  }
}
