import { Component, ViewContainerRef } from '@angular/core';
import { DialogService } from './services/dialog.service';
import { WsService } from './services/ws.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(dialogService: DialogService, viewContainerRef: ViewContainerRef, wsService: WsService) {
    wsService.init();
    dialogService.setRootViewContainerRef(viewContainerRef);
  }
}
