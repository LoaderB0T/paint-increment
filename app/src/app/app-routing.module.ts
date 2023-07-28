import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlSegment } from '@angular/router';
import { DownloadComponent } from './download/download.component';
import { HomeComponent } from './home/home.component';
import { LobbyIterationsComponent } from './lobby-iterations/lobby-iterations.component';
import { LobbyComponent } from './lobby/lobby.component';
import { NewLobbyComponent } from './new-lobby/new-lobby.component';
import { lobbyResolver } from './resolver/lobby.resolver';
import { isPaintingGuard } from './resolver/is-painting.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'new',
    component: NewLobbyComponent,
  },
  {
    matcher: url => {
      const match = url.join('/').match(/^lobby\/(?:[a-z0-9_]+\/)?([a-z0-9-]+)(\/.*)?/i);
      const suffix = match?.[2];
      if (match) {
        return {
          consumed: suffix ? url.slice(0, -1) : url,
          posParams: { id: new UrlSegment(match[1], {}) },
        };
      }
      return null;
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: LobbyComponent,
        resolve: {
          lobby: lobbyResolver,
        },
        canDeactivate: [isPaintingGuard],
      },
      {
        path: 'iterations',
        component: LobbyIterationsComponent,
        resolve: {
          lobby: lobbyResolver,
        },
      },
      {
        path: 'download',
        component: DownloadComponent,
        resolve: {
          lobby: lobbyResolver,
        },
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
