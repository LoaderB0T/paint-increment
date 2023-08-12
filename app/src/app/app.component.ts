import { Component, ViewContainerRef } from '@angular/core';
import { DialogService } from './services/dialog.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(dialogService: DialogService, viewContainerRef: ViewContainerRef) {
    dialogService.setRootViewContainerRef(viewContainerRef);
  }
}
