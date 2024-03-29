import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { TextboxComponent } from '../controls/textbox/textbox.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, TextboxComponent, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  private readonly _authService = inject(AuthService);

  public google() {
    this._authService.initiateGoogleSignIn();
  }

  public back() {
    window.history.back();
  }
}
