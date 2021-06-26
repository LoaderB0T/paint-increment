import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { LobbyResponse } from '../.api/models/lobby-response';
import { ApiService } from '../.api/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyResolver implements Resolve<LobbyResponse> {
  private readonly _apiService: ApiService;

  constructor(apiService: ApiService) {
    this._apiService = apiService;
  }

  resolve(route: ActivatedRouteSnapshot): Observable<LobbyResponse> {
    return this._apiService.lobbyControllerGetLobby({
      lobbyId: route.params.id
    });
  }
}
