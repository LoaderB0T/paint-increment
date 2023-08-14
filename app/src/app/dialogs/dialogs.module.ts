import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InviteCodeComponent } from './invite-code/invite-code.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { FormsModule } from '@angular/forms';
import { ControlsModule } from '../controls/controls.module';
import { ConfirmedOrRejectedComponent } from './confirmed-or-rejected/confirmed-or-rejected.component';
import { NoMobileComponent } from './no-mobile/no-mobile.component';
import { TimeUpComponent } from './time-up/time-up.component';
import { EditIterationComponent } from './edit-iteration/edit-iteration.component';
import { CanvasComponent } from '../canvas/canvas.component';

@NgModule({
  declarations: [
    InviteCodeComponent,
    UserInfoComponent,
    ConfirmedOrRejectedComponent,
    NoMobileComponent,
    TimeUpComponent,
    EditIterationComponent,
  ],
  imports: [CommonModule, FormsModule, ControlsModule, CanvasComponent],
})
export class DialogsModule {}
