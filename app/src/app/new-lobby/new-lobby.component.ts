import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ApiService } from '../.api/services/api.service';
import { validityTexts } from '../controls/models/validity-texts.model';
import { IdService } from '../services/id.service';
import { UserInfoService } from '../services/user-info.service';

@UntilDestroy()
@Component({
  templateUrl: './new-lobby.component.html',
  styleUrls: ['./new-lobby.component.scss']
})
export class NewLobbyComponent {
  private readonly _router: Router;
  private readonly _apiService: ApiService;
  private readonly _idService: IdService;
  private readonly _userInfoService: UserInfoService;

  private readonly _lobbyName = new BehaviorSubject('');
  private readonly $lobbyName = this._lobbyName.asObservable().pipe(debounceTime(150), untilDestroyed(this));
  private _checkingLobbyName = false;
  public lobbyNameAvailable: boolean = true;
  public maxPixels: number = 250;
  public size: number = 100;
  public emailAddress: string = '';
  public clickedButton: boolean = false;
  public validityTexts = validityTexts;

  @ViewChild('newLobby', { static: true })
  private readonly _formElement!: NgForm;

  constructor(router: Router, apiService: ApiService, idService: IdService, userInfoService: UserInfoService) {
    this._router = router;
    this._apiService = apiService;
    this._idService = idService;
    this._userInfoService = userInfoService;

    this.$lobbyName.subscribe(name => {
      this._apiService.lobbyControllerLobbyNameAvailable({ body: { name } }).then(available => {
        this.lobbyNameAvailable = available;
        this._checkingLobbyName = false;
      });
    });
  }

  public get lobbyName(): string {
    return this._lobbyName.value;
  }

  public set lobbyName(value: string) {
    this._checkingLobbyName = true;
    this._lobbyName.next(value);
  }

  public get formDisabled(): boolean {
    if (this.clickedButton || this._checkingLobbyName || !this.lobbyNameAvailable) {
      return true;
    }

    return !this._formElement.valid ?? false;
  }

  public async createLobby() {
    this.clickedButton = true;
    const lobby = await this._apiService.lobbyControllerPostLobby({
      body: {
        name: this.lobbyName,
        email: this.emailAddress,
        uid: this._idService.id,
        settings: {
          maxPixels: this.maxPixels,
          height: +this.size,
          width: +this.size
        }
      }
    });
    if (!lobby.isCreator) {
      throw new Error('Something went wrong, you should be the owner');
    }
    this._userInfoService.email = this.emailAddress;
    this._router.navigate(['lobby', lobby.id]);
  }
}
