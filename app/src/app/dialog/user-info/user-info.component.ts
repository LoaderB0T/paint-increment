import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, DialogBase, TextboxComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';
import { UserInfoService } from '@shared/shared/user-info';

@Component({
  imports: [FormsModule, ButtonComponent, TextboxComponent],
  selector: 'awd-user-info',
  templateUrl: 'user-info.component.html',
  styleUrls: ['user-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoComponent extends DialogBase<boolean> {
  protected readonly i18n = injectI18n();
  protected readonly _userInfoService = inject(UserInfoService);

  protected readonly username = signal(this._userInfoService.name);
  protected readonly email = signal(this._userInfoService.email);

  protected save() {
    this._userInfoService.name = this.username();
    this._userInfoService.email = this.email();
    this.close(this._userInfoService.initialized);
  }
}
