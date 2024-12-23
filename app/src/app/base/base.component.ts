import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'awd-base',
  imports: [RouterOutlet],
  templateUrl: 'base.component.html',
  styleUrls: ['base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseComponent implements AfterViewInit {
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly enableRouterTransitions = signal(false);

  public ngAfterViewInit(): void {
    if (this._isBrowser) {
      setTimeout(() => {
        this.enableRouterTransitions.set(true);
      }, 1000);
    }
  }
}
