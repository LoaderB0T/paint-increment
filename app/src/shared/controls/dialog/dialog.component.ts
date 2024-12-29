import { ChangeDetectionStrategy, Component, viewChild, ViewContainerRef } from '@angular/core';

@Component({
  imports: [],
  selector: 'awd-dialog',
  templateUrl: 'dialog.component.html',
  styleUrls: ['dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  public readonly container = viewChild.required('container', { read: ViewContainerRef });
  protected readonly randomTapeSrc = `/tape/tape${Math.floor(Math.random() * 10) + 1}.png`;
}
