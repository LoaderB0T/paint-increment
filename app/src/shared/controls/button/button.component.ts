import { Component, input, output } from '@angular/core';

@Component({
  selector: 'awd-button',
  templateUrl: 'button.component.html',
  styleUrls: ['button.component.scss'],
})
export class ButtonComponent {
  public readonly text = input<string>();
  public readonly icon = input<string>();
  public readonly border = input<boolean>(true);
  public readonly active = input<boolean>(false);
  public readonly img = input('');
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public readonly onClick = output<void>();
}
