import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../controls/directives/tooltip';
import { DialogService } from '../../services/dialog.service';
import { UserInfoComponent } from '../../dialogs/user-info/user-info.component';

@Component({
  selector: 'app-auth-info',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  templateUrl: './auth-info.component.html',
  styleUrls: ['./auth-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthInfoComponent {
  private readonly _dialogService: DialogService;

  constructor(dialogService: DialogService) {
    this._dialogService = dialogService;
  }

  public showUserInfo() {
    this._dialogService.showComponentDialog(UserInfoComponent, c => {
      c.canDoLater = true;
    });
  }
}
