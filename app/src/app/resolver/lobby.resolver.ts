import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { LobbyResponse } from '../.api/models/lobby-response';
import { ApiService } from '../.api/services/api.service';
import { IdService } from '../services/id.service';

export const lobbyResolver: ResolveFn<LobbyResponse> = (route: ActivatedRouteSnapshot) => {
  const apiService = inject(ApiService);
  const idService = inject(IdService);

  return apiService.lobbyControllerGetLobby({
    lobbyId: route.params.id,
    uid: idService.id,
  });
};
