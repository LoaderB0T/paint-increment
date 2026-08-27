import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay, withNoIncrementalHydration } from '@angular/platform-browser';
import { provideRouter, withViewTransitions } from '@angular/router';
import { ApiConfiguration, provideApi, WsService } from '@shared/api';
import { AuthService } from '@shared/auth';
import { environment, loadEnv } from '@shared/env';
import { TranslateService } from '@shared/i18n';
import { UserInfoService } from '@shared/shared/user-info';
import { loadHammer } from '@shared/utils';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
    provideAppInitializer(async () => {
      const appCfg = inject(ApiConfiguration);
      const authService = inject(AuthService);
      const userInfoService = inject(UserInfoService);
      const wsService = inject(WsService);
      // Nothing may render before the translations are in - an untranslated first paint
      // shows raw keys, and on the server it gets serialized into the HTML.
      const translationsReady = inject(TranslateService).ready;
      await loadEnv();
      appCfg.rootUrl =
        typeof process === 'object' && process.env['APP_PORT']
          ? `localhost:${process.env['APP_PORT']}`
          : environment.apiUrl;
      authService.init();

      await loadHammer();
      await userInfoService.init();
      await wsService.init();
      await translationsReady;
    }),
    provideApi(),
  ],
};
