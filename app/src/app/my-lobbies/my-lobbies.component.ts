import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../.api/services/api.service';
import { BehaviorSubject } from 'rxjs';
import { LobbyPreviewResponse } from '../.api/models/lobby-preview-response';
import { Router } from '@angular/router';
import { safeLobbyName } from '../util/safe-lobby-name';

@Component({
  selector: 'app-my-lobbies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-lobbies.component.html',
  styleUrls: ['./my-lobbies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyLobbiesComponent {
  private readonly _apiService: ApiService;
  private readonly _router: Router;

  public readonly lobbies = signal<LobbyPreviewResponse[]>([]);

  constructor(apiService: ApiService, router: Router) {
    this._apiService = apiService;
    this._router = router;
    this._apiService.lobbyControllerMyLobbies().then(response => {
      this.lobbies.set(response);
    });
  }

  public openLobby(lobby: LobbyPreviewResponse): void {
    this._router.navigate(['/lobby', safeLobbyName(lobby.name), lobby.id]);
  }
}
