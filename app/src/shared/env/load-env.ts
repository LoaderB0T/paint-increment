import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { objectKeys } from '@awd/shared/utils';

import { environment } from './environment';

export async function loadEnv() {
  const win = inject(DOCUMENT).defaultView;
  const file = await fetch(`${win?.location.origin}/environment.json`, {
    cache: 'no-store',
  });
  const env = (await file.json()) as typeof environment;

  objectKeys(env).forEach((k) => {
    (environment[k] as any) = env[k];
  });
}
