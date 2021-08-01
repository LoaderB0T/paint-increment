import { Component, ViewContainerRef } from '@angular/core';
import { PopupService } from './services/popup.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(popupService: PopupService, viewContainerRef: ViewContainerRef) {
    popupService.setRootViewContainerRef(viewContainerRef);
  }
}
