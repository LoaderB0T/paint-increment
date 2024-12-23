import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'awd-my-lobbies',
  templateUrl: 'my-lobbies.component.html',
  styleUrls: ['my-lobbies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyLobbiesComponent {
  private readonly _router = inject(Router);
  constructor() {}

  public goToHome(): void {
    this._router.navigate(['/']);
  }
}
