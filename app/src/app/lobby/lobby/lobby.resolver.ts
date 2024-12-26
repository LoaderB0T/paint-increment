import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RedirectCommand, Router } from '@angular/router';
import { LobbyResponse, LobbyService } from '@shared/api';
import { assertBody, isBrowser } from '@shared/utils';

export async function lobbyResolver(
  route: ActivatedRouteSnapshot
): Promise<LobbyResponse | RedirectCommand> {
  const router = inject(Router);
  const lobbyService = inject(LobbyService);
  const browser = isBrowser();
  const response = await lobbyService.lobbyControllerGetLobby({
    lobbyId: route.params['id'],
    isBrowser: browser,
  });
  if (!response.ok) {
    const loginPath = router.parseUrl('/');
    return new RedirectCommand(loginPath);
  }
  const lobby = assertBody(response);
  return lobby;
}
