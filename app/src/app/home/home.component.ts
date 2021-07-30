import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private readonly _router: Router;

  constructor(router: Router) {
    this._router = router;
  }

  public navigateToNewLobby() {
    this._router.navigate(['new']);
  }
}
