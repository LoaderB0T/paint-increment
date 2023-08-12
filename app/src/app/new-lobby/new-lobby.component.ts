import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { CreateLobbyRequest } from '../.api/models/create-lobby-request';

import { ApiService } from '../.api/services/api.service';
import { validityTexts } from '../controls/models/validity-texts.model';
import { IdService } from '../services/id.service';
import { UserInfoService } from '../services/user-info.service';
import { safeLobbyName } from '../util/safe-lobby-name';

@UntilDestroy()
@Component({
  templateUrl: './new-lobby.component.html',
  styleUrls: ['./new-lobby.component.scss'],
})
export class NewLobbyComponent {
  private readonly _router: Router;
  private readonly _apiService: ApiService;
  private readonly _idService: IdService;
  private readonly _userInfoService: UserInfoService;

  public lobbyNameAvailable: boolean = true;
  public maxPixels: number = 250;
  public lobbyName = '';
  public ownerName = '';
  public size: number = 100;
  public timeLimit: number = 15;
  public clickedButton: boolean = false;
  public validityTexts = validityTexts;

  @ViewChild('newLobby', { static: true })
  private readonly _formElement!: NgForm;

  constructor(
    router: Router,
    apiService: ApiService,
    idService: IdService,
    userInfoService: UserInfoService
  ) {
    this._router = router;
    this._apiService = apiService;
    this._idService = idService;
    this._userInfoService = userInfoService;
  }

  public get formDisabled(): boolean {
    if (this.clickedButton || !this.lobbyNameAvailable) {
      return true;
    }

    return !this._formElement.valid ?? false;
  }

  public async createLobby() {
    this.clickedButton = true;
    const request: CreateLobbyRequest = {
      name: this.lobbyName,
      ownerName: this.ownerName,
      settings: {
        maxPixels: this.maxPixels,
        height: +this.size,
        width: +this.size,
        timeLimit: +this.timeLimit,
      },
    };
    console.log(request);
    const lobby = await this._apiService.lobbyControllerPostLobby({
      body: request,
    });
    if (!lobby.isCreator) {
      throw new Error('Something went wrong, you should be the owner');
    }
    // this._userInfoService.email = this.emailAddress;
    this._router.navigate(['lobby', safeLobbyName(lobby.name), lobby.id]);
  }
}
