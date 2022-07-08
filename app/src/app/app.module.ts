import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NewLobbyComponent,
    LobbyComponent,
    LobbyIterationsComponent,
    ActionsComponent,
    DownloadComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NgLetModule,
    ApiModule.forRoot({ rootUrl: environment.apiUrl }),
    DialogsModule,
    ControlsModule,
    TutorialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
