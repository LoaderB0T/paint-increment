import { Component, ViewContainerRef } from '@angular/core';
import { DialogService } from './services/dialog.service';
import { WsService } from './services/ws.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly _deviceService: DeviceDetectorService;

  constructor(
    dialogService: DialogService,
    viewContainerRef: ViewContainerRef,
    wsService: WsService,
    deviceService: DeviceDetectorService
  ) {
    this._deviceService = deviceService;
    wsService.init();
    dialogService.setRootViewContainerRef(viewContainerRef);
  }

  public get isMobile(): boolean {
    return this._deviceService.isMobile();
  }
}
