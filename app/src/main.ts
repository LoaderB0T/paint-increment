import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

fetch('environment.json', { cache: 'no-store' })
  .then(res => res.json())
  .then(async (env: any) => {
    Object.keys(environment).forEach(k => {
      (environment as any)[k] = env[k];
    });

    platformBrowserDynamic()
      .bootstrapModule((await import('./app/app.module')).AppModule)
      .catch(err => console.error(err));
  });
