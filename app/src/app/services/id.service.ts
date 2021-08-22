import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';

@Injectable({ providedIn: 'root' })
export class IdService {
  private readonly _id: string;
  constructor() {
    const uid = localStorage.getItem('uid') ?? uuid();
    this._id = uid;
    localStorage.setItem('uid', uid);
  }

  get id(): string {
    return this._id;
  }
}
