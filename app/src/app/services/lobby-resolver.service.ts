import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { LobbyResponse } from '../.api/models/lobby-response';
import { ApiService } from '../.api/services/api.service';
import { IdService } from './id.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyResolver implements Resolve<LobbyResponse> {
  private readonly _apiService: ApiService;
  private readonly _idService: IdService;

  constructor(apiService: ApiService, idService: IdService) {
    this._apiService = apiService;
    this._idService = idService;
  }

  resolve(route: ActivatedRouteSnapshot): Promise<LobbyResponse> {
    return this._apiService.lobbyControllerGetLobby({
      lobbyId: route.params.id,
      uid: this._idService.id
    });
  }
}
