import { inject, Injectable, REQUEST } from '@angular/core';
import { isBrowser } from '@shared/utils';

@Injectable({ providedIn: 'root' })
export class CookieService {
  private readonly _request = inject(REQUEST);
  private readonly _isBrowser = isBrowser();

  public set(key: string, value: string, expires?: number) {
    if (!this._isBrowser) {
      return;
    }
    const date = new Date();
    date.setTime(date.getTime() + (expires ?? 365) * 24 * 60 * 60 * 1000);
    document.cookie = `${key}=${value}; expires=${date.toUTCString()}; path=/`;
  }

  public get(key: string): string | null {
    const cookies = this._isBrowser ? document.cookie : this._request?.headers.get('cookie');

    if (!cookies) {
      return null;
    }

    const cookie = cookies.split('; ').find(x => x.startsWith(`${key}=`));
    return cookie?.split('=')[1] ?? null;
  }

  public delete(key: string) {
    if (!this._isBrowser) {
      return;
    }
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }
}
