import { Injectable, ViewContainerRef } from '@angular/core';
import { SubscriptionManager, throwExp } from '@shared/utils';

import { DialogBase } from './dialog-base.component';
import { DialogComponent } from './dialog.component';

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

  public showComponentDialog<T extends DialogBase>(
    componentType: new (...args: unknown[]) => T,
    initializer?: (component: T) => void
  ): T {
    if (!this._rootViewContainer) {
      throw new Error('setRootViewContainerRef has not been called yet');
    }

    const newId = this.getRandomId();

    this._subMgrs.push({ id: newId, mgr: new SubscriptionManager() });
    const hostComponent = this._rootViewContainer.createComponent(DialogComponent);
    const component = hostComponent.instance.container().createComponent(componentType);

    initializer?.(component.instance);
    if (component.instance.closeDialog) {
      const hideSub = component.instance.closeDialog.subscribe((id: string) => {
        const indexToRemove = this._rootViewContainer.indexOf(hostComponent.hostView);
        if (indexToRemove > -1) {
          this._rootViewContainer.remove(indexToRemove);
        }
        this._subMgrs.find(subMgr => subMgr.id === id)?.mgr?.unsubscribeAll();
        if (this._rootViewContainer.length === 0) {
          this.dialogVisible = false;
        }
      });
      this._subMgrs.find(subMgr => subMgr.id === newId)?.mgr?.add(hideSub);
    } else {
      console.error('This Component does not implement the DialogBase Class:', component.instance);
      throw new Error('This Component does not implement the DialogBase Class');
    }

    this.dialogVisible = true;
    return component.instance;
  }

  private getRandomId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
}
