import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withViewTransitions } from '@angular/router';
import { ApiConfiguration, provideApi } from '@shared/api';
import { AuthService } from '@shared/auth';
import { environment, loadEnv } from '@shared/env';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    provideAppInitializer(async () => {
      const appCfg = inject(ApiConfiguration);
      const authService = inject(AuthService);
      await loadEnv();
      appCfg.rootUrl =
        typeof process === 'object' && process.env['APP_PORT']
          ? `localhost:${process.env['APP_PORT']}`
          : environment.apiUrl;
      authService.init();
    }),
    provideApi(),
  ],
};
