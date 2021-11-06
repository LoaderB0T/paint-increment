import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  templateUrl: './tutorial-overlay.component.html',
  styleUrls: ['./tutorial-overlay.component.scss'],
  selector: 'app-tutorial-overlay'
})
export class TutorialOverlayComponent {
  visible: boolean = false;
  private _id?: string;
  constructor() {}

  @Input() text: string = '';
  @Input() set id(value: string) {
    this._id = value;
    const tutorialState = JSON.parse(localStorage.getItem('tutorial') || '{}');
    this.visible = !tutorialState[this._id];
  }

  public close() {
    this.visible = false;
    const tutorialState = JSON.parse(localStorage.getItem('tutorial') || '{}');
    if (!this._id) {
      throw new Error('TutorialOverlayComponent: id is not set');
    }
    tutorialState[this._id] = true;
    localStorage.setItem('tutorial', JSON.stringify(tutorialState));
  }
}
