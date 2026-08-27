import { inject, Service } from '@angular/core';
import { StorageService } from '@shared/shared/storage';
import { isBrowser, throwExp } from '@shared/utils';
import Session from 'supertokens-web-js/recipe/session';
import { v4 as uuid } from 'uuid';

@Service()
export class IdService {
  private readonly _storage = inject(StorageService).init<string>('uid', uuid());
  private readonly _isBrowser = isBrowser();
  public async id(): Promise<string> {
    const hasSesion = this._isBrowser && (await Session.doesSessionExist());
    if (hasSesion) {
      const userId = await Session.getUserId();
      return userId ?? this._storage.value ?? throwExp('User id not found');
    }
    return this._storage.value ?? throwExp('User id not found');
  }
}
