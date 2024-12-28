import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal, ViewContainerRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DialogService } from '@shared/controls';
import { fromEvent } from 'rxjs';

import { BaseComponent } from './base/base.component';

const cursors = ['default', 'pointer', 'text', 'none'] as const;
type Cursor = (typeof cursors)[number];

@Component({
  selector: 'app-root',
  imports: [BaseComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly squigglyCount = Array.from({ length: 20 }, (_, i) => i);
  private readonly _mouseMove = toSignal(fromEvent(inject(DOCUMENT), 'pointermove'));
  private readonly _mouseLeave = toSignal(fromEvent(inject(DOCUMENT), 'pointerleave'));
  private readonly _cursorKind = signal<Cursor>('default');
  protected readonly cursorUrl = computed(() => `cursor_${this._cursorKind()}.png`);
  protected readonly cursorPos = signal({ top: -100, left: -100 });

  constructor() {
    inject(DialogService).setRootViewContainerRef(inject(ViewContainerRef));
    effect(() => {
      const evt = this._mouseMove() as PointerEvent | undefined;
      if (!evt) {
        return;
      }
      if (evt.pointerType !== 'mouse') {
        this.cursorPos.set({ top: -100, left: -100 });
        return;
      }

      this.cursorPos.set({ top: evt.clientY, left: evt.clientX });
      const target = evt.target as HTMLElement | null;
      if (!target) {
        return;
      }
      const cursorVar = getComputedStyle(target).getPropertyValue('--cursor')?.toString();
      this._cursorKind.set(cursors.some(x => x === cursorVar) ? (cursorVar as Cursor) : 'default');
    });
    effect(() => {
      const evt = this._mouseLeave() as PointerEvent | undefined;
      if (!evt) {
        return;
      }
      this.cursorPos.set({ top: -100, left: -100 });
    });
  }
}
