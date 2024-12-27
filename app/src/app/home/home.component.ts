import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '@shared/controls';
import { TranslateService } from '@shared/i18n';

@Component({
  selector: 'awd-home',
  imports: [ButtonComponent],
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly _router = inject(Router);
  protected readonly i18n = inject(TranslateService).translations;
  constructor() {}

  protected navigateToNewLobby(): void {
    this._router.navigate(['lobby', 'new']);
  }
  protected navigateToMyLobbies(): void {
    this._router.navigate(['lobby', 'my']);
  }
}
