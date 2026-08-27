import { afterNextRender, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'awd-base',
  imports: [RouterOutlet],
  templateUrl: 'base.component.html',
  styleUrls: ['base.component.scss'],
})
export class BaseComponent {
  protected readonly enableRouterTransitions = signal(false);

  constructor() {
    afterNextRender(() => {
      setTimeout(() => {
        this.enableRouterTransitions.set(true);
      }, 1000);
    });
  }
}
