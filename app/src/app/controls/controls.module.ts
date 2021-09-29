import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextboxComponent } from './textbox/textbox.component';
import { FormsModule } from '@angular/forms';
import { EqualWidthDirective } from './equal-width.directive';

@NgModule({
  declarations: [TextboxComponent, EqualWidthDirective],
  imports: [CommonModule, FormsModule],
  exports: [TextboxComponent]
})
export class ControlsModule {}
