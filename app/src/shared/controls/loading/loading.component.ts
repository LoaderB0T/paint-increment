import { Component, input } from '@angular/core';

/**
 * Hand-drawn "pen writes ..." loading indicator.
 *
 * Size: add `class="s"` or `class="l"`, or set `--awd-loading-size` for anything else.
 */
@Component({
  selector: 'awd-loading',
  templateUrl: 'loading.component.html',
  styleUrls: ['loading.component.scss'],
})
export class LoadingComponent {
  /** Announced to screen readers while the indicator is on screen. */
  public readonly label = input('Loading');
}
