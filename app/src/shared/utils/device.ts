import { isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({
  providedIn: 'root',
})
export class DeviceService extends DeviceDetectorService {
  private readonly _request = inject(REQUEST, { optional: true });
  constructor() {
    const platformId = inject(PLATFORM_ID);
    super(platformId);
    if (isPlatformServer(platformId)) {
      super.setDeviceInfo((this._request?.headers.get('user-agent') as string) || '');
    }
  }

  public isTouchDevice(): boolean {
    return this.isMobile() || this.isTablet();
  }
}
