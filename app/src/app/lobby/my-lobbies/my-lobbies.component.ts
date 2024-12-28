import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LobbyPreviewResponse, LobbyService } from '@shared/api';
import { ButtonComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';
import { assertBody, safeLobbyName } from '@shared/utils';

type LobbyVM = LobbyPreviewResponse & {
  link: string[];
};

@Component({
  selector: 'awd-my-lobbies',
  imports: [ButtonComponent, RouterLink],
  templateUrl: 'my-lobbies.component.html',
  styleUrls: ['my-lobbies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyLobbiesComponent {
  private readonly _router = inject(Router);
  private readonly _lobbyService: LobbyService;
  protected readonly i18n = injectI18n();
  public readonly lobbies = signal<LobbyVM[]>([]);

  constructor(lobbyService: LobbyService, router: Router) {
    this._lobbyService = lobbyService;
    this._router = router;
    this._lobbyService.lobbyControllerMyLobbies().then(response => {
      if (!response.ok) {
        // TODO: Handle error
        return;
      }
      const lobbies = assertBody(response);
      const mapped = lobbies
        .map(lobby => ({
          ...lobby,
          link: ['..', safeLobbyName(lobby.name), lobby.id],
        }))
        .reverse();
      this.lobbies.set(mapped);
    });
  }

  protected navigateHome(): void {
    this._router.navigate(['/']);
  }
}
