import { ComponentFactoryResolver, Injectable, ViewContainerRef } from '@angular/core';
import { PopupComponent } from '../popup/popup.component';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private readonly _componentFactoryResolver: ComponentFactoryResolver;
  private _rootViewContainer?: ViewContainerRef;

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    this._componentFactoryResolver = componentFactoryResolver;
  }

  public setRootViewContainerRef(viewContainerRef: ViewContainerRef) {
    this._rootViewContainer = viewContainerRef;
  }

  public show() {
    if (!this._rootViewContainer) {
      throw new Error('rootViewContainer has not been set');
    }
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(PopupComponent);
    const index = this._rootViewContainer.length;
    const componentRef = this._rootViewContainer.createComponent(componentFactory);

    componentRef.instance.index = index;

    return componentRef.instance;
  }

  public hide(index: number) {
    this._rootViewContainer?.remove(index);
  }
}
