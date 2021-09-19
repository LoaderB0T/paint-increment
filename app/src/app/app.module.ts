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
import { TooltipDirective } from './directives/tooltip';
import { DialogsModule } from './dialogs/dialogs.module';
import { ActionsComponent } from './actions/actions.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, NewLobbyComponent, LobbyComponent, LobbyIterationsComponent, TooltipDirective, ActionsComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ApiModule.forRoot({ rootUrl: environment.apiUrl }),
    DialogsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
