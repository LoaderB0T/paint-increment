/**
 * DIRECTION CONTRACT
 *
 * THESIS: the front door proves the mechanic instead of describing it — the same sheet,
 *   drawn over four times by four different hands. Refuses the hero-plus-screenshot page.
 * OWN-WORLD: inherited. Textured paper sheet on a cool grey desk, Playpen Sans ink,
 *   SVG-displaced wobbly outlines, translucent masking tape, ink #0d0d12. #ff0052 is spent
 *   on one thing only: the contribution that just landed. Buttons carry a highlighter
 *   swipe in marker yellow and orange, and the hand-drawn box is the focus ring.
 * STORY: one canvas, one friend at a time → here is a real finished one → start your own.
 * FIRST VIEWPORT: handwritten welcome and lead top-left; under it a taped strip of four
 *   canvases that draw themselves in, left to right, numbered and captioned by hand, ink
 *   arrows between them; the sheet's existing action row stays pinned at the bottom.
 * FORM: extension of the existing paper surface. Taped contact-sheet strip, first on my
 *   ordered list of structures. Local extension, so no concept roll.
 */
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared/auth';
import { ButtonComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';

import { isBrowser, observeWidth } from '../../shared/utils';
import { EXAMPLE_SIZE, exampleLayers } from '../example/example-project';
import { CanvasComponent, CanvasSettings } from '../lobby/canvas/canvas.component';

/** How many contributions each sheet in the strip has received. */
const STAGES = [1, 6, 11, 16];
const TOTAL_TICKS = STAGES.reduce((sum, n) => sum + n, 0);
const TICK_MS = 70;

@Component({
  selector: 'awd-home',
  imports: [ButtonComponent, CanvasComponent],
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export class HomeComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _browser = isBrowser();
  protected readonly i18n = injectI18n();
  protected readonly loggedIn = signal(false);

  protected readonly settings: Required<CanvasSettings> = {
    width: EXAMPLE_SIZE,
    height: EXAMPLE_SIZE,
    canvasPattern: false,
    maxPixels: 0,
  };

  private readonly _stageBoxes = viewChildren<ElementRef<HTMLElement>>('stageBox');
  private readonly _stageSize = signal(0);
  protected readonly stageSize = this._stageSize.asReadonly();

  /** Starts finished, so a server render and a no-script visit both show the whole story. */
  private readonly _tick = signal(TOTAL_TICKS);

  protected readonly stages = computed(() => {
    const tick = this._tick();
    const copy = [
      { title: this.i18n.home_step1Title(), text: this.i18n.home_step1Text() },
      { title: this.i18n.home_step2Title(), text: this.i18n.home_step2Text() },
      { title: this.i18n.home_step3Title(), text: this.i18n.home_step3Text() },
      { title: this.i18n.home_step4Title(), text: this.i18n.home_step4Text() },
    ];
    let start = 0;
    return STAGES.map((target, index) => {
      const count = Math.max(0, Math.min(target, tick - start));
      start += target;
      return {
        step: index + 1,
        tape: `/tape/tape${index * 3 + 1}.png`,
        layers: exampleLayers(count),
        ...copy[index],
      };
    });
  });

  constructor() {
    if (this._browser) {
      this._authService.hasSession().then(loggedIn => this.loggedIn.set(loggedIn));
    }

    observeWidth(this._stageBoxes, this._stageSize);

    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      this._tick.set(0);
      const handle = setInterval(() => {
        this._tick.update(tick => tick + 1);
        if (this._tick() >= TOTAL_TICKS) {
          clearInterval(handle);
        }
      }, TICK_MS);
      this._destroyRef.onDestroy(() => clearInterval(handle));
    });
  }

  protected navigateToNewLobby(): void {
    this._router.navigate(['lobby', 'new']);
  }
  protected navigateToMyLobbies(): void {
    this._router.navigate(['lobby', 'my']);
  }
  protected navigateToTutorial(): void {
    this._router.navigate(['tutorial']);
  }
  protected navigateToExample(): void {
    this._router.navigate(['example']);
  }
  protected async logout() {
    await this._authService.logout();
    this.loggedIn.set(false);
  }
}
