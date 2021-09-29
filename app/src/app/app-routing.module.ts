import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LobbyIterationsComponent } from './lobby-iterations/lobby-iterations.component';
import { LobbyComponent } from './lobby/lobby.component';
import { NewLobbyComponent } from './new-lobby/new-lobby.component';
import { IsPaintingGuard } from './services/is-painting.guard';
import { LobbyResolver } from './services/lobby-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'new',
    component: NewLobbyComponent
  },
  {
    path: 'lobby/:id',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: LobbyComponent,
        resolve: {
          lobby: LobbyResolver
        },
        canDeactivate: [IsPaintingGuard]
      },
      {
        path: 'iterations',
        component: LobbyIterationsComponent,
        resolve: {
          lobby: LobbyResolver
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
