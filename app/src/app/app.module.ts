import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { ApiModule } from './.api/api.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NewLobbyComponent } from './new-lobby/new-lobby.component';
import { LobbyComponent } from './lobby/lobby.component';
import { LobbyIterationsComponent } from './lobby-iterations/lobby-iterations.component';
import { environment } from '../environments/environment';
import { DialogsModule } from './dialogs/dialogs.module';
import { ActionsComponent } from './actions/actions.component';
import { ControlsModule } from './controls/controls.module';
import { TutorialModule } from './tutorial-overlay/tutorial.module';
import { DownloadComponent } from './download/download.component';
import { NgLetModule } from 'ng-let';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { AuthInfoComponent } from './auth/auth-info/auth-info.component';
import { WsService } from './services/ws.service';
import { MyLobbiesComponent } from './my-lobbies/my-lobbies.component';
import { CanvasComponent } from './canvas/canvas.component';

async function initializeApp(authService: AuthService, wsService: WsService): Promise<any> {
  authService.init();
  await wsService.init();
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NewLobbyComponent,
    LobbyComponent,
    LobbyIterationsComponent,
    ActionsComponent,
    DownloadComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AuthModule,
    FormsModule,
    NgLetModule,
    ApiModule.forRoot({
      rootUrl:
        typeof process === 'object' && process.env.APP_PORT
          ? `localhost:${process.env.APP_PORT}`
          : environment.apiUrl,
    }),
    DialogsModule,
    ControlsModule,
    TutorialModule,
    AuthInfoComponent,
    MyLobbiesComponent,
    CanvasComponent,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService, wsService: WsService) => () =>
        initializeApp(authService, wsService),
      deps: [AuthService, WsService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
