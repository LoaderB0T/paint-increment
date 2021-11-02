import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlsModule } from '../controls/controls.module';
import { TutorialOverlayComponent } from './tutorial-overlay.component';

@NgModule({
  declarations: [TutorialOverlayComponent],
  imports: [CommonModule, FormsModule, ControlsModule],
  exports: [TutorialOverlayComponent]
})
export class TutorialModule {}
