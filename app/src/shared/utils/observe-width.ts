import { afterRenderEffect, ElementRef, Signal, WritableSignal } from '@angular/core';

/**
 * Keeps `target` at the rendered width of the first element in `boxes`.
 *
 * `awd-canvas` wants its size as a px number, so anything that lays canvases out on a
 * fluid grid has to measure the cell the grid produced. Call from an injection context.
 */
export function observeWidth(
  boxes: Signal<readonly ElementRef<HTMLElement>[]>,
  target: WritableSignal<number>
): void {
  afterRenderEffect(onCleanup => {
    const box = boxes()[0]?.nativeElement;
    if (!box) {
      return;
    }
    const observer = new ResizeObserver(() => {
      target.set(Math.round(box.getBoundingClientRect().width));
    });
    observer.observe(box);
    onCleanup(() => observer.disconnect());
  });
}
