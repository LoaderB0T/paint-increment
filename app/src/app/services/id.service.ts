import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';

@Injectable({ providedIn: 'root' })
export class IdService {
  private readonly _id: string;
  constructor() {
    this._id = uuid();
  }

  get id(): string {
    return this._id;
  }
}
