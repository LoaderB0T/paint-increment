import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InviteCodeComponent } from './invite-code/invite-code.component';
import { IncrementDetailsComponent } from './increment-details/increment-details.component';
import { FormsModule } from '@angular/forms';
import { ControlsModule } from '../controls/controls.module';
import { ConfirmedOrRejectedComponent } from './confirmed-or-rejected/confirmed-or-rejected.component';
import { DownloadColorComponent } from './download-color/download-color.component';

@NgModule({
  declarations: [InviteCodeComponent, IncrementDetailsComponent, ConfirmedOrRejectedComponent, DownloadColorComponent],
  imports: [CommonModule, FormsModule, ControlsModule]
})
export class DialogsModule {}
