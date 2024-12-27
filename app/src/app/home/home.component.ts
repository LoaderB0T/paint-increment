import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared/auth';
import { ButtonComponent } from '@shared/controls';
import { TranslateService } from '@shared/i18n';

import { isBrowser } from '../../shared/utils';

@Component({
  selector: 'awd-home',
  imports: [ButtonComponent],
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _browser = isBrowser();
  protected readonly i18n = inject(TranslateService).translations;
  protected readonly loggedIn = signal(false);

  constructor() {
    if (this._browser) {
      this._authService.hasSession().then(loggedIn => this.loggedIn.set(loggedIn));
    }
  }

  protected navigateToNewLobby(): void {
    this._router.navigate(['lobby', 'new']);
  }
  protected navigateToMyLobbies(): void {
    this._router.navigate(['lobby', 'my']);
  }
  protected logout() {
    this._authService.logout();
  }
}
