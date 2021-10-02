import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextboxComponent } from './textbox/textbox.component';
import { FormsModule } from '@angular/forms';
import { EqualWidthDirective } from './equal-width.directive';
import { TooltipDirective } from './directives/tooltip';

@NgModule({
  declarations: [TextboxComponent, EqualWidthDirective, TooltipDirective],
  imports: [CommonModule, FormsModule],
  exports: [TextboxComponent, TooltipDirective]
})
export class ControlsModule {}
