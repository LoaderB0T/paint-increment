import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'awd-lobby',
  templateUrl: 'lobby.component.html',
  styleUrls: ['lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyComponent {
  private readonly _router = inject(Router);
  constructor() {}

  public goToHome(): void {
    this._router.navigate(['/']);
  }
}
