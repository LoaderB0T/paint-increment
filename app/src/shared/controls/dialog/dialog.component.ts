import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  imports: [],
  selector: 'awd-dialog',
  templateUrl: 'dialog.component.html',
  styleUrls: ['dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent implements AfterViewInit, OnDestroy {
  public readonly container = viewChild.required('container', { read: ViewContainerRef });
  private readonly _dialogElement = viewChild.required<ElementRef<HTMLDivElement>>('dialog');

  protected readonly randomTapeSrc = `/tape/tape${Math.floor(Math.random() * 10) + 1}.png`;
  protected readonly dialogTop = signal(0);
  private _topInterval?: NodeJS.Timeout | number;

  public ngAfterViewInit(): void {
    this._dialogElement().nativeElement.focus();
    this._topInterval = setInterval(() => {
      const dialogRect = this._dialogElement().nativeElement.getBoundingClientRect();
      const top = dialogRect.top;
      this.dialogTop.set(top);
    }, 10);
  }

  public ngOnDestroy(): void {
    if (this._topInterval) {
      clearInterval(this._topInterval);
    }
  }
}
