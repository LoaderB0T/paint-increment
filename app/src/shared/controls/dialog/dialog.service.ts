import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { SubscriptionManager, throwExp } from '@shared/utils';

import { DialogBase } from './dialog-base.component';
import { DialogComponent } from './dialog.component';

type DialogHandle<C extends DialogBase<unknown>, T> = {
  componentRef: ComponentRef<C>;
  result: Promise<T | null>;
};

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private __rootViewContainer?: ViewContainerRef;
  private readonly _subMgrs = new Array<{ id: string; mgr: SubscriptionManager }>();

  private get _rootViewContainer() {
    return this.__rootViewContainer ?? throwExp('RootViewContainerRef not set');
  }

  public dialogVisible: boolean = false;

  public hideAllDialogs() {
    this._rootViewContainer?.clear();
    this._subMgrs.forEach(subMgr => {
      subMgr.mgr.unsubscribeAll();
    });
    this._subMgrs.length = 0;
    this.dialogVisible = false;
  }

  public setRootViewContainerRef(viewContainerRef: ViewContainerRef) {
    this.__rootViewContainer = viewContainerRef;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public showComponentDialog<T extends DialogBase<any>>(
    componentType: new (...args: unknown[]) => T
  ): DialogHandle<T, T extends DialogBase<infer D> ? D : never> {
    if (!this._rootViewContainer) {
      throw new Error('setRootViewContainerRef has not been called yet');
    }

    const prom = Promise.withResolvers<T extends DialogBase<infer D> ? D : never | null>();

    const newId = this.getRandomId();

    this._subMgrs.push({ id: newId, mgr: new SubscriptionManager() });
    const hostComponent = this._rootViewContainer.createComponent(DialogComponent);
    const componentRef = hostComponent.instance.container().createComponent(componentType);

    if ('result' in componentRef.instance) {
      componentRef.instance.result.then(res => {
        prom.resolve(res ?? null);
        const indexToRemove = this._rootViewContainer.indexOf(hostComponent.hostView);
        if (indexToRemove > -1) {
          this._rootViewContainer.remove(indexToRemove);
        }
        if (this._rootViewContainer.length === 0) {
          this.dialogVisible = false;
        }
      });
    } else {
      console.error(
        'This Component does not implement the DialogBase Class:',
        componentRef.instance
      );
      throw new Error('This Component does not implement the DialogBase Class');
    }

    this.dialogVisible = true;
    return {
      componentRef,
      result: prom.promise,
    };
  }

  private getRandomId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
}
