import { Routes } from '@angular/router';
import { AuthComponent, AuthCallbackComponent } from '@shared/auth';
import { isLoggedInGuard } from '@shared/auth/auth.guard';

import { HomeComponent } from './home/home.component';
import { LobbyComponent } from './lobby/lobby/lobby.component';
import { lobbyResolver } from './lobby/lobby/lobby.resolver';
import { MyLobbiesComponent } from './lobby/my-lobbies/my-lobbies.component';
import { NewLobbyComponent } from './lobby/new-lobby/new-lobby.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'lobby',
    children: [
      {
        path: 'new',
        component: NewLobbyComponent,
        canActivate: [isLoggedInGuard],
      },
      {
        path: 'my',
        component: MyLobbiesComponent,
        canActivate: [isLoggedInGuard],
      },
      {
        path: ':name/:id',
        component: LobbyComponent,
        runGuardsAndResolvers: 'always',
        resolve: {
          lobby: lobbyResolver,
        },
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: AuthComponent,
      },
      {
        path: 'callback/:provider',
        component: AuthCallbackComponent,
      },
    ],
  },
];
