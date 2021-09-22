import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../.api/services/api.service';
import { IdService } from '../services/id.service';

@Component({
  templateUrl: './new-lobby.component.html',
  styleUrls: ['./new-lobby.component.scss']
})
export class NewLobbyComponent {
  public lobbyName: string = '';
  public maxPixels: number = 250;
  private readonly _apiService: ApiService;
  private readonly _idService: IdService;
  private readonly _router: Router;

  constructor(apiService: ApiService, router: Router, idService: IdService) {
    this._apiService = apiService;
    this._idService = idService;
    this._router = router;
  }

  createLobby() {
    this._apiService
      .lobbyControllerPostLobby({
        body: {
          name: this.lobbyName,
          uid: this._idService.id,
          settings: {
            maxPixels: this.maxPixels
          }
        }
      })
      .subscribe(lobby => {
        if (!lobby.isCreator) {
          throw new Error('Something went wrong, you should be the owner');
        }
        this._router.navigate(['lobby', lobby.id]);
      });
  }
}
