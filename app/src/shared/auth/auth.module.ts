import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthCallbackComponent } from './callback/callback.component';
import { AuthComponent } from './auth.component';

const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AuthComponent,
      },
      {
        path: 'callback/:provider',
        component: AuthCallbackComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), AuthComponent],
  exports: [],
  declarations: [],
  providers: [],
})
export class AuthModule {}
