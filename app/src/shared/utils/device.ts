import { isPlatformServer } from '@angular/common';
import { inject, Service, PLATFORM_ID, REQUEST } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Service()
export class DeviceService extends DeviceDetectorService {
  private readonly _request = inject(REQUEST, { optional: true });
  constructor() {
    const platformId = inject(PLATFORM_ID);
    super();
    if (isPlatformServer(platformId)) {
      super.setDeviceInfo((this._request?.headers.get('user-agent') as string) || '');
    }
  }

  public isTouchDevice(): boolean {
    return this.isMobile() || this.isTablet();
  }
}
