import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { TextboxComponent } from '../controls/textbox/textbox.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, TextboxComponent, ReactiveFormsModule, HttpClientModule],
  templateUrl: './auth.component.html',
  styleUrls: [],
})
export class AuthComponent {
  private readonly _authService: AuthService;
  private readonly _http: HttpClient;

  constructor(authService: AuthService, http: HttpClient) {
    this._authService = authService;
    this._http = http;
  }

  public google() {
    this._authService.initiateGoogleSignIn();
  }

  public test() {
    this._http.get('http://localhost:3000/lobby/test').subscribe(data => {
      console.log(data);
    });
  }
}
