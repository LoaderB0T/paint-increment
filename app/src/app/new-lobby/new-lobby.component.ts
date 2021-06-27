import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../.api/services/api.service';
import { LobbyCacheService } from '../services/lobby-cache.service';

@Component({
  templateUrl: './new-lobby.component.html',
  styleUrls: ['./new-lobby.component.scss']
})
export class NewLobbyComponent {
  public lobbyName: string = '';
  private readonly _apiService: ApiService;
  private readonly _router: Router;
  private readonly _lobbyCacheService: LobbyCacheService;

  constructor(apiService: ApiService, router: Router, lobbyCacheService: LobbyCacheService) {
    this._apiService = apiService;
    this._router = router;
    this._lobbyCacheService = lobbyCacheService;
  }

  createLobby() {
    this._apiService
      .lobbyControllerPostLobby({
        body: {
          name: this.lobbyName
        }
      })
      .subscribe(lobby => {
        if (!lobby.creatorToken) {
          throw new Error('Did not receive creatorToken for own lobby');
        }
        this._lobbyCacheService.addCreatorToken(lobby.id, lobby.creatorToken);
        this._router.navigate(['lobby', lobby.id]);
      });
  }
}
