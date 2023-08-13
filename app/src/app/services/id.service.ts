import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import Session from 'supertokens-web-js/recipe/session';

@Injectable({ providedIn: 'root' })
export class IdService {
  private readonly _id: string;
  constructor() {
    const uid = localStorage.getItem('uid') ?? uuid();
    this._id = uid;
    localStorage.setItem('uid', uid);
  }

  get id(): Promise<string> {
    return Session.doesSessionExist().then(hasSession =>
      hasSession ? Session.getUserId().then(id => id ?? this._id) : this._id
    );
  }
}
