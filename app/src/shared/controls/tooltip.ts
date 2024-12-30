import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';

@Directive({
  selector: '[tooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private readonly _renderer = inject(Renderer2);
  private readonly _document = inject(DOCUMENT);
  private readonly _el = inject(ElementRef<HTMLElement>);
  private _tooltip?: HTMLSpanElement;
  private _shown: boolean = false;

  @Input('tooltip') tooltipTitle: string = '';

  @HostListener('mouseenter')
  public onMouseEnter() {
    if (!this._shown) {
      this.show();
    }
  }

  @HostListener('mouseleave')
  public onMouseLeave() {
    this.hide();
  }

  @HostListener('focusout')
  public onBlur() {
    this.hide(true);
  }

  public ngOnDestroy(): void {
    this.hide();
  }

  private show() {
    const padding = 20;

    this._shown = true;

    const tooltip = this._renderer.createElement('span') as HTMLSpanElement;

    this._tooltip = tooltip;
    tooltip.innerText = this.tooltipTitle;
    tooltip.classList.add('tooltip');
    setTimeout(() => {
      tooltip.classList.add('visible');
    }, 1);
    this._renderer.appendChild(this._document.body, tooltip);

    const hostPos = this._el.nativeElement.getBoundingClientRect();

    const tooltipPos = tooltip.getBoundingClientRect();

    const scrollPos =
      window.scrollY ||
      this._document.documentElement.scrollTop ||
      this._document.body.scrollTop ||
      0;

    let top = hostPos.top - tooltipPos.height - 10;

    if (top < 0) {
      top = hostPos.bottom + 10;
    }

    const cssPaddingLeftRight = 16;
    let left = hostPos.left + (hostPos.width - tooltipPos.width) / 2 + cssPaddingLeftRight;

    const tooRight = tooltip.clientWidth + padding + left - this._document.body.clientWidth;
    if (tooRight > 0) {
      left -= tooRight;
    }

    if (left < padding) {
      left = padding;
    }

    this._renderer.setStyle(this._tooltip, 'top', `${top + scrollPos}px`);
    this._renderer.setStyle(this._tooltip, 'left', `${left}px`);
  }

  private hide(instant = false) {
    if (!this._shown) {
      return;
    }

    const toRemove = this._tooltip;
    this._renderer.removeClass(toRemove, 'visible');
    this._shown = false;
    setTimeout(
      () => {
        this._renderer.removeChild(this._document.body, toRemove);
      },
      instant ? 0 : 500
    );
  }
}
