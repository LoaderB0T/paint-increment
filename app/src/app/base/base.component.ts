import { AfterViewInit, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isBrowser } from '@shared/utils';

@Component({
  selector: 'awd-base',
  imports: [RouterOutlet],
  templateUrl: 'base.component.html',
  styleUrls: ['base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseComponent implements AfterViewInit {
  private readonly _isBrowser = isBrowser();
  protected readonly enableRouterTransitions = signal(false);

  public ngAfterViewInit(): void {
    if (this._isBrowser) {
      setTimeout(() => {
        this.enableRouterTransitions.set(true);
      }, 1000);
    }
  }
}
