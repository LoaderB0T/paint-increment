import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  templateUrl: './tutorial-overlay.component.html',
  styleUrls: ['./tutorial-overlay.component.scss'],
  selector: 'app-tutorial-overlay'
})
export class TutorialOverlayComponent {
  @Output() closed = new EventEmitter();

  @Input() hasInvite: boolean = false;
  @Input() lockedBySomeone: boolean = false;
  @Input() lockedByMe: boolean = false;
  @Input() pendingConfirm: boolean = false;

  constructor() {}

  public close() {
    this.closed.next();
  }
}
