import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TooltipDirective } from '../../controls/directives/tooltip';
import { UserInfoComponent } from '../../dialogs/user-info/user-info.component';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-auth-info',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  templateUrl: './auth-info.component.html',
  styleUrls: ['./auth-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthInfoComponent {
  private readonly _dialogService = inject(DialogService);

  public showUserInfo() {
    this._dialogService.showComponentDialog(UserInfoComponent, c => {
      c.canDoLater = true;
    });
  }
}
