import { Component, HostListener, ViewContainerRef } from '@angular/core';
import { PopupService } from './services/popup.service';
import { WsService } from './services/ws.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly _wsService: WsService;

  @HostListener('window:beforeunload')
  beforeunloadHandler() {
    this._wsService.close();
  }

  constructor(popupService: PopupService, viewContainerRef: ViewContainerRef, wsService: WsService) {
    this._wsService = wsService;
    popupService.setRootViewContainerRef(viewContainerRef);
  }
}
