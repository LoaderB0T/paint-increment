import { inject, Injectable, signal } from '@angular/core';

import { CookieService } from './cookie.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly _cookieService = inject(CookieService);

  public init<T>(key: string, defaultValue: T) {
    return new StorageHandle<T>(key, this._cookieService, defaultValue);
  }
}

class StorageHandle<T> {
  private readonly _key: string;
  private readonly _cookieService: CookieService;
  public readonly valueSig = signal<T | null>(null);

  constructor(key: string, cookieService: CookieService, defaultValue: T) {
    this._key = key;
    this._cookieService = cookieService;

    if (this.value === null) {
      this.value = defaultValue;
    }
    this.valueSig.set(this.value);
  }

  public get value(): T | null {
    const value = this._cookieService.get(this._key);
    if (!value) {
      return null;
    }
    return JSON.parse(value);
  }

  public set value(value: T | null) {
    if (value === null) {
      this._cookieService.delete(this._key);
      this.valueSig.set(null);
      return;
    }
    this._cookieService.set(this._key, JSON.stringify(value));
    this.valueSig.set(value);
  }

  public update(update: (value: T) => T) {
    this.value = update(this.value ?? ({} as T));
  }
}
