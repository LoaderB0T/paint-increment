import { Injectable, ViewContainerRef } from '@angular/core';
import { BaseDialog } from '../models/base-dialog.model';
import { SubscriptionManager } from '../models/subscription-manager';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private _rootViewContainer?: ViewContainerRef;
  private _subMgrs = new Array<{ id: string; mgr: SubscriptionManager }>();

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
    this._rootViewContainer = viewContainerRef;
  }

  public showComponentDialog<T extends BaseDialog>(
    componentType: new (...args: any[]) => T,
    initializer?: (component: T) => void
  ): T {
    if (!this._rootViewContainer) {
      throw new Error('setRootViewContainerRef has not been called yet');
    }

    const newId = this.getRandomId();

    this._subMgrs.push({ id: newId, mgr: new SubscriptionManager() });
    const component = this._rootViewContainer.createComponent(componentType);
    initializer?.(component.instance);

    if (component.instance.closeDialog) {
      const hideSub = component.instance.closeDialog.subscribe((id: string) => {
        const indexToRemove = this._rootViewContainer!.indexOf(component.hostView);
        if (indexToRemove > -1) {
          this._rootViewContainer!.remove(indexToRemove);
        }
        this._subMgrs.find(subMgr => subMgr.id === id)?.mgr?.unsubscribeAll();
        if (this._rootViewContainer!.length === 0) {
          this.dialogVisible = false;
        }
      });
      this._subMgrs.find(subMgr => subMgr.id === newId)?.mgr?.add(hideSub);
    } else {
      // should rather not happen I hope
      console.warn('This Component does not implement the BaseDialog Class:');
      console.warn(component.instance);
    }

    this._rootViewContainer.insert(component.hostView);
    this.dialogVisible = true;
    return component.instance;
  }

  private getRandomId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
}
