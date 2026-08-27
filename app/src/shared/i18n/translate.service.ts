import { effect, Service } from '@angular/core';
import { BaseTranslateService } from '@ngneers/signal-translate';

import type translations from './en.json';

@Service()
export class TranslateService extends BaseTranslateService<typeof translations> {
  private readonly _ready = Promise.withResolvers<void>();

  /**
   * Resolves once a translation set is in the signal. Until then every key reads back as
   * its own name, so bootstrap awaits this - on the server too, where the base class's
   * fire-and-forget load is not a pending task and would let raw keys be serialized.
   */
  public readonly ready = this._ready.promise;

  constructor() {
    super(['en'], 'en');
    effect(() => {
      if (this.translations()) {
        this._ready.resolve();
      }
    });
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
