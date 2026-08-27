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

@Component({
  selector: 'awd-dialog',
  templateUrl: 'dialog.component.html',
  styleUrls: ['dialog.component.scss'],
})
export class DialogComponent {
  private readonly _document = inject(DOCUMENT);
  public readonly container = viewChild.required('container', { read: ViewContainerRef });
  private readonly _dialogElement = viewChild.required<ElementRef<HTMLDivElement>>('dialog');

  protected readonly randomTapeSrc = `/tape/tape${Math.floor(Math.random() * 10) + 1}.png`;
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
        this.dialogHeight.set(el.getBoundingClientRect().height);
      });
      observer.observe(el);
      onCleanup(() => observer.disconnect());
    });
  }
}
