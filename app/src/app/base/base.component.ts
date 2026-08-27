import { afterNextRender, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { LoadingComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';
import { filter, map } from 'rxjs';

@Component({
  selector: 'awd-base',
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: 'base.component.html',
  styleUrls: ['base.component.scss'],
})
export class BaseComponent {
  protected readonly i18n = injectI18n();
  protected readonly enableRouterTransitions = signal(false);

  /**
   * True while the router is resolving a navigation. Route resolvers (lobbyResolver) hit
   * the API before the outlet swaps, so without this the old page just sits there.
   */
  protected readonly navigating = toSignal(
    inject(Router).events.pipe(
      filter(
        e =>
          e instanceof NavigationStart ||
          e instanceof NavigationEnd ||
          e instanceof NavigationCancel ||
          e instanceof NavigationError ||
          e instanceof NavigationSkipped
      ),
      map(e => e instanceof NavigationStart)
    ),
    { initialValue: false }
  );

  constructor() {
    afterNextRender(() => {
      setTimeout(() => {
        this.enableRouterTransitions.set(true);
      }, 1000);
    });
  }
}
