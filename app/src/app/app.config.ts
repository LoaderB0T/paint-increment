import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withViewTransitions } from '@angular/router';
import { ApiConfiguration, provideApi, WsService } from '@shared/api';
import { AuthService } from '@shared/auth';
import { environment, loadEnv } from '@shared/env';
import { UserInfoService } from '@shared/shared/user-info';
import { loadHammer } from '@shared/utils';

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
      const userInfoService = inject(UserInfoService);
      const wsService = inject(WsService);
      await loadEnv();
      appCfg.rootUrl =
        typeof process === 'object' && process.env['APP_PORT']
          ? `localhost:${process.env['APP_PORT']}`
          : environment.apiUrl;
      authService.init();
      await Promise.all([loadHammer(), userInfoService.init(), wsService.init()]);
    }),
    provideApi(),
  ],
};
