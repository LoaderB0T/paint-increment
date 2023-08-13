import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from './directives/tooltip';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { TextboxComponent } from './textbox/textbox.component';

@NgModule({
  declarations: [CheckboxComponent],
  imports: [CommonModule, FormsModule, TextboxComponent, TooltipDirective],
  exports: [CheckboxComponent, TooltipDirective, TextboxComponent],
})
export class ControlsModule {}
