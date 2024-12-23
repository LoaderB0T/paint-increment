import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '@shared/controls/button/button.component';
import { TranslateService } from '@shared/i18n/translate.service';

@Component({
  selector: 'awd-my-lobbies',
  imports: [ButtonComponent],
  templateUrl: 'my-lobbies.component.html',
  styleUrls: ['my-lobbies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyLobbiesComponent {
  private readonly _router = inject(Router);
  protected readonly i18n = inject(TranslateService).translations;
  constructor() {}

  protected navigateHome(): void {
    this._router.navigate(['/']);
  }
}
