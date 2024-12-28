import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateLobbyRequest, LobbyService } from '@shared/api';
import { ButtonComponent, TextboxComponent } from '@shared/controls';
import { injectI18n } from '@shared/i18n';
import { assertBody, objectKeys, safeLobbyName } from '@shared/utils';

@Component({
  selector: 'awd-new-lobby',
  imports: [ReactiveFormsModule, TextboxComponent, ButtonComponent],
  templateUrl: 'new-lobby.component.html',
  styleUrls: ['new-lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewLobbyComponent {
  private readonly _lobbyService = inject(LobbyService);
  private readonly _router = inject(Router);
  protected readonly i18n = injectI18n();
  constructor() {}

  protected readonly form = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]),
    maxPixels: new FormControl(250, [
      Validators.required,
      Validators.min(1),
      Validators.max(99999),
    ]),
    size: new FormControl(100, [Validators.required, Validators.min(50), Validators.max(200)]),
    timeLimit: new FormControl(15, [Validators.required, Validators.min(1), Validators.max(60)]),
  });

  protected async createLobby() {
    const objKeys = objectKeys(this.form.controls);
    objKeys.forEach(key => {
      this.form.controls[key].markAsTouched();
    });
    if (this.form.invalid) {
      return;
    }
    this.form.disable();
    const request: CreateLobbyRequest = {
      name: this.form.controls.name.value ?? '',
      ownerName: '',
      settings: {
        maxPixels: +(this.form.controls.maxPixels.value ?? '250'),
        height: +(this.form.controls.size.value ?? '100'),
        width: +(this.form.controls.size.value ?? '100'),
        timeLimit: +(this.form.controls.timeLimit.value ?? '15'),
      },
    };

    const response = await this._lobbyService.lobbyControllerPostLobby({
      body: request,
    });
    if (!response.ok) {
      this.form.enable();
      // TODO: handle error
      return;
    }
    const lobby = assertBody(response);
    if (!lobby.isCreator) {
      // TODO: handle error
      throw new Error('Something went wrong, you should be the owner');
    }
    this._router.navigate(['lobby', safeLobbyName(lobby.name), lobby.id]);
  }

  protected goToHome(): void {
    this._router.navigate(['/']);
  }
}
