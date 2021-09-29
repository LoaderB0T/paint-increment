import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[equalWidth]'
})
export class EqualWidthDirective implements AfterViewInit {
  @Input() equalWidth?: HTMLElement;
  private readonly _el: ElementRef<HTMLElement>;

  constructor(el: ElementRef<HTMLElement>) {
    this._el = el;
  }

  ngAfterViewInit(): void {
    if (this.equalWidth) {
      // setTimeout(() => {
      //   this._el.nativeElement.style.width = `${this.equalWidth!.clientWidth}px`;
      // }, 1000);
      new ResizeObserver(() => {
        this._el.nativeElement.style.width = `${this.equalWidth!.clientWidth}px`;
      }).observe(this.equalWidth);
    }
  }
}
