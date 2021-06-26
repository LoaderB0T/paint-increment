import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../.api/services/api.service';

@Component({
  templateUrl: './new-lobby.component.html',
  styleUrls: ['./new-lobby.component.scss']
})
export class NewLobbyComponent {
  public lobbyName: string = '';
  private readonly _apiService: ApiService;
  private readonly _router: Router;

  constructor(apiService: ApiService, router: Router) {
    this._apiService = apiService;
    this._router = router;
  }

  createLobby() {
    this._apiService
      .lobbyControllerPostLobby({
        body: {
          name: this.lobbyName
        }
      })
      .subscribe(lobby => {
        this._router.navigate(['lobby', lobby.id]);
      });
  }
}
