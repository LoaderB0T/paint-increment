import { inject } from '@angular/core';

import { TranslateService } from './translate.service';

export function injectI18n() {
  const translations = inject(TranslateService).translations;
  return translations as Omit<typeof translations, ''>;
}
