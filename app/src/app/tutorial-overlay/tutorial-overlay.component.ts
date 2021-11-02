import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  templateUrl: './tutorial-overlay.component.html',
  styleUrls: ['./tutorial-overlay.component.scss'],
  selector: 'app-tutorial-overlay'
})
export class TutorialOverlayComponent {
  visible: boolean = true;
  constructor() {}

  @Input() text: string = '';

  close() {
    this.visible = false;
  }
}
