import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InviteCodeComponent } from './invite-code/invite-code.component';
import { IncrementDetailsComponent } from './increment-details/increment-details.component';
import { FormsModule } from '@angular/forms';
import { ControlsModule } from '../controls/controls.module';
import { ConfirmedOrRejectedComponent } from './confirmed-or-rejected/confirmed-or-rejected.component';
import { DownloadComponent } from './download/download.component';
import { NoMobileComponent } from './no-mobile/no-mobile.component';
import { TimeUpComponent } from './time-up/time-up.component';

@NgModule({
  declarations: [
    InviteCodeComponent,
    IncrementDetailsComponent,
    ConfirmedOrRejectedComponent,
    DownloadComponent,
    NoMobileComponent,
    TimeUpComponent
  ],
  imports: [CommonModule, FormsModule, ControlsModule]
})
export class DialogsModule {}
