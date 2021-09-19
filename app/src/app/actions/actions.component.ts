import { Component, Input } from '@angular/core';
import { ActionItem } from '../models/action-item.model';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent {
  @Input() actionItems: ActionItem[] = [];

  constructor() {}

  public get visibleActions(): ActionItem[] {
    return this.actionItems.filter(x => x.visible());
  }
}
