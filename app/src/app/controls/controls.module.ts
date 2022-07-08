import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextboxComponent } from './textbox/textbox.component';
import { FormsModule } from '@angular/forms';
import { EqualWidthDirective } from './equal-width.directive';
import { TooltipDirective } from './directives/tooltip';
import { CheckboxComponent } from './checkbox/checkbox.component';

@NgModule({
  declarations: [TextboxComponent, CheckboxComponent, EqualWidthDirective, TooltipDirective],
  imports: [CommonModule, FormsModule],
  exports: [TextboxComponent, CheckboxComponent, TooltipDirective]
})
export class ControlsModule {}
