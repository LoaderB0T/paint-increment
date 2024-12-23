import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'awd-base',
  imports: [RouterOutlet],
  templateUrl: 'base.component.html',
  styleUrls: ['base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseComponent {}
