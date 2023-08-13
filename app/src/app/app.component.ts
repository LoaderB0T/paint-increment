import { Component, ViewContainerRef } from '@angular/core';
import { DialogService } from './services/dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly _router: Router;

  constructor(dialogService: DialogService, viewContainerRef: ViewContainerRef, router: Router) {
    dialogService.setRootViewContainerRef(viewContainerRef);
    this._router = router;
  }

  public home() {
    this._router.navigate(['']);
  }
}
