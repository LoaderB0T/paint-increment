import { NgModule } from '@angular/core';
import { TooltipDirective } from './directives/tooltip';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { TextboxComponent } from './textbox/textbox.component';

@NgModule({
  declarations: [],
  imports: [TextboxComponent, CheckboxComponent, TooltipDirective],
  exports: [CheckboxComponent, TooltipDirective, TextboxComponent],
})
export class ControlsModule {}
