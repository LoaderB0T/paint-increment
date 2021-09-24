import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InviteCodeComponent } from './invite-code/invite-code.component';
import { IncrementDetailsComponent } from './increment-details/increment-details.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [InviteCodeComponent, IncrementDetailsComponent],
  imports: [CommonModule, FormsModule]
})
export class DialogsModule {}
