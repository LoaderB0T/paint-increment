import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'awd-new-lobby',
  templateUrl: 'new-lobby.component.html',
  styleUrls: ['new-lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewLobbyComponent {
  private readonly _router = inject(Router);
  constructor() {}

  public goToHome(): void {
    this._router.navigate(['/']);
  }
}
