import {
  afterNextRender,
  afterRenderEffect,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  ViewContainerRef,
  DOCUMENT,
} from '@angular/core';

/** Longest we wait for the leave animation before tearing the dialog out anyway. */
const EXIT_ANIMATION_TIMEOUT_MS = 800;

@Component({
  selector: 'awd-dialog',
  templateUrl: 'dialog.component.html',
  styleUrls: ['dialog.component.scss'],
})
export class DialogComponent {
  private readonly _document = inject(DOCUMENT);
  private readonly _hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  public readonly container = viewChild.required('container', { read: ViewContainerRef });
  private readonly _dialogElement = viewChild.required<ElementRef<HTMLDivElement>>('dialog');

  protected readonly randomTapeSrc = `/tape/tape${Math.floor(Math.random() * 10) + 1}.png`;
  // a hand never sticks a note on dead straight, so the tape sits at its own small angle. The
  // paper itself cannot be tilted at rest: a transform on it would re-parent the position:fixed
  // text caret inside the dialog content.
  protected readonly randomTapeTilt = Math.random() * 7 - 3.5;
  // nobody rips a note off twice the same way, so vary how far it spins on the way out
  protected readonly randomRipSpin = 0.75 + Math.random() * 0.5;
  protected readonly dialogHeight = signal(0);

  constructor() {
    afterNextRender(() => {
      const activeElement = this._document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    });

    afterRenderEffect(onCleanup => {
      const el = this._dialogElement().nativeElement;
      const observer = new ResizeObserver(() => {
        // offsetHeight, not getBoundingClientRect(): the latter reports the projected height of
        // the 3D enter/leave transforms and would shift the dialog's top mid-animation
        this.dialogHeight.set(el.offsetHeight);
      });
      observer.observe(el);
      onCleanup(() => observer.disconnect());
    });
  }

  /** Plays the rip-off animation and resolves once it has finished. */
  public playExit(): Promise<unknown> {
    const host = this._hostElement.nativeElement;
    host.classList.add('leaving');
    const finished = Promise.all(
      host
        .getAnimations({ subtree: true })
        // getAnimations() also returns CSS transitions, and the hover transitions on the
        // paper and the tape get cancelled the moment the pointer moves - a cancelled
        // transition rejects its finished promise and would cut the rip short.
        .filter(animation => 'animationName' in animation)
        // Per-animation catch, so one cancelled animation cannot collapse the whole wait.
        .map(animation => animation.finished.catch(() => undefined))
    );
    // Animations are paused while the document is hidden, so never wait forever.
    const timeout = new Promise(resolve => setTimeout(resolve, EXIT_ANIMATION_TIMEOUT_MS));
    return Promise.race([finished, timeout]);
  }
}
