import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LobbyComponent } from './lobby/lobby/lobby.component';
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
      },
      {
        path: 'my',
        component: MyLobbiesComponent,
      },
      {
        path: ':id',
        component: LobbyComponent,
      },
    ],
  },
];
