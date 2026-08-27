import { ComponentRef, Service, Type, ViewContainerRef } from '@angular/core';
import { throwExp } from '@shared/utils';

import { DialogBase } from './dialog-base.component';
import { DialogComponent } from './dialog.component';

type DialogResult<C> = C extends DialogBase<infer D> ? D : never;

type DialogHandle<C extends DialogBase<unknown>, T> = {
  componentRef: ComponentRef<C>;
  result: Promise<T | null>;
};

@Service()
export class DialogService {
  private _rootViewContainer?: ViewContainerRef;

  public setRootViewContainerRef(viewContainerRef: ViewContainerRef) {
    this._rootViewContainer = viewContainerRef;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public showComponentDialog<T extends DialogBase<any>>(
    componentType: Type<T>
  ): DialogHandle<T, DialogResult<T>> {
    const root =
      this._rootViewContainer ?? throwExp('setRootViewContainerRef has not been called yet');

    const hostComponent = root.createComponent(DialogComponent);
    const componentRef = hostComponent.instance.container().createComponent(componentType);

    const result = componentRef.instance.result.then(async res => {
      await hostComponent.instance.playExit();
      const indexToRemove = root.indexOf(hostComponent.hostView);
      if (indexToRemove > -1) {
        root.remove(indexToRemove);
      }
      return (res ?? null) as DialogResult<T> | null;
    });

    return { componentRef, result };
  }
}
