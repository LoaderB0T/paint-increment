import { Component, inject, resource } from '@angular/core';
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
})
export class MyLobbiesComponent {
  private readonly _router = inject(Router);
  private readonly _lobbyService = inject(LobbyService);
  protected readonly i18n = injectI18n();

  public readonly lobbies = resource<LobbyVM[], void>({
    defaultValue: [],
    loader: async () => {
      const response = await this._lobbyService.lobbyControllerMyLobbies();
      if (!response.ok) {
        // TODO: Handle error
        return [];
      }
      return assertBody(response)
        .map(lobby => ({
          ...lobby,
          link: ['..', safeLobbyName(lobby.name), lobby.id],
        }))
        .reverse();
    },
  });

  protected navigateHome(): void {
    this._router.navigate(['/']);
  }
}
