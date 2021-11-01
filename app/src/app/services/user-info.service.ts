import { Injectable } from '@angular/core';
import { UserInfo } from '../models/user-info.model';

@Injectable({ providedIn: 'root' })
export class UserInfoService {
  private _name: string;
  private _email: string;

  constructor() {
    const userInfo = JSON.parse(localStorage.getItem('user-info') ?? '{}') as UserInfo;
    this._name = userInfo.name ?? '';
    this._email = userInfo.email ?? '';
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
