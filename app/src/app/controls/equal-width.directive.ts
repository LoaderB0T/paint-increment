import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[equalWidth]',
  standalone: true,
})
export class EqualWidthDirective implements AfterViewInit {
  @Input() equalWidth?: HTMLElement;
  private readonly _el: ElementRef<HTMLElement>;

  constructor(el: ElementRef<HTMLElement>) {
    this._el = el;
  }

  ngAfterViewInit(): void {
    if (this.equalWidth) {
      new ResizeObserver(() => {
        this._el.nativeElement.style.width = `${this.equalWidth!.clientWidth}px`;
      }).observe(this.equalWidth);
    }
  }
}
