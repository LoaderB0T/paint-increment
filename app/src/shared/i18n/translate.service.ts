import { Injectable } from '@angular/core';
import { BaseTranslateService } from '@ngneers/signal-translate';

import type translations from './en.json';

@Injectable({ providedIn: 'root' })
export class TranslateService extends BaseTranslateService<typeof translations> {
  constructor() {
    super(['en'], 'en');
  }

  protected override async loadTranslations(lang: string) {
    switch (lang) {
      case 'en': {
        const x = await import('./en.json');
        return x.default;
      }
      // case 'de': {
      //   const x = await import('./de.json');
      //   return x.default;
      // }
      default:
        throw new Error(`Language ${lang} is not supported`);
    }
  }
}
