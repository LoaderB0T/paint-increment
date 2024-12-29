import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'awd-button',
  templateUrl: 'button.component.html',
  styleUrls: ['button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  constructor() {}

  public readonly text = input<string>();
  public readonly icon = input<string>();
  public readonly tooltip = input<string>();
  public readonly border = input<boolean>(true);
  public readonly active = input<boolean>(false);
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public readonly onClick = output<void>();
}
