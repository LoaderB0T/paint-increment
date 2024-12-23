import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'awd-button',
  templateUrl: 'button.component.html',
  styleUrls: ['button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  private readonly _router = inject(Router);
  constructor() {}

  public readonly text = input<string>();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public readonly onClick = output<void>();
}
