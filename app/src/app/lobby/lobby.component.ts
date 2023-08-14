import { AfterViewInit, Component, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { LobbyResponse } from '../.api/models/lobby-response';
import { ApiService } from '../.api/services/api.service';
import { ActionItem } from '../models/action-item.model';
import { InviteCodeComponent } from '../dialogs/invite-code/invite-code.component';
import { DialogService } from '../services/dialog.service';
import { LobbyLockService } from '../services/lobby-lock.service';
import { UserInfoComponent } from '../dialogs/user-info/user-info.component';
import { UserInfoService } from '../services/user-info.service';
import { ConfirmedOrRejectedComponent } from '../dialogs/confirmed-or-rejected/confirmed-or-rejected.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NoMobileComponent } from '../dialogs/no-mobile/no-mobile.component';
import { TimeUpComponent } from '../dialogs/time-up/time-up.component';
import { safeLobbyName } from '../util/safe-lobby-name';
import { CanvasSettings, Layer } from '../canvas/canvas.component';
import { pixelArrayToIncrementPixel } from '../util/pixel-array-to-increment-pixel';

@UntilDestroy()
@Component({
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements AfterViewInit, OnInit {
  private readonly _activatedRoute: ActivatedRoute;
  private readonly _apiService: ApiService;
  private readonly _router: Router;
  private readonly _dialogService: DialogService;
  private readonly _lobbyLockService: LobbyLockService;
  private readonly _userInfoService: UserInfoService;
  private readonly _deviceService: DeviceDetectorService;

  private _inviteCode?: string;
  private _editTimeLeft: number = 0;
  private _timeUpComponent?: TimeUpComponent;

  private readonly _drawLayer = signal<Layer>({
    color: '#00FF00',
    pixels: [],
  });
  private readonly _draftLayer = signal<Layer>({
    color: '#FF0042',
    pixels: [],
  });
  private readonly _committedLayer = signal<Layer>({
    color: '#000000',
    pixels: [],
  });
  public readonly lobbyLayers = computed<Layer[]>(() => [
    this._drawLayer(),
    this._draftLayer(),
    this._committedLayer(),
  ]);

  public canvasSettings: CanvasSettings = {
    canvasPattern: true,
    height: 0,
    width: 0,
    maxPixels: 0,
  };

  public hoveredCoords?: [number, number];
  public drawCount: number = 0;
  public lobby: LobbyResponse;
  public isLockedByMe: boolean = false;
  public isLockedBySomebodyElse: boolean = false;
  public isLockedByName: string | undefined;
  public editTimeLeftLabel: string = '';
  public tutorialVisible: boolean = false;
  public explainControlsBeforeStart: boolean = false;

  public actionItems: ActionItem[] = [
    {
      text: 'Create new invite link',
      icon: 'share-alt',
      action: () => this.showInviteDialog(),
      visible: () => this.isCreator && !this.canPaint,
    },
    {
      text: 'Reset image',
      icon: 'eraser',
      action: () => this.resetImage(),
      visible: () => this.canPaint,
    },
    {
      text: 'Submit paint iteration',
      icon: 'layer-plus',
      action: () => this.commitIteration(),
      visible: () => this.canPaint,
    },
    {
      text: 'Start painting',
      icon: 'paint-brush-fine',
      action: () => this.startToPaint(),
      visible: () => this.canStartToPaint,
    },
    {
      text: 'Accept paint iteration',
      icon: 'check',
      action: () => this.acceptIteration(),
      visible: () => this.isCreator && this.hasUnconfirmedIteration,
    },
    {
      text: 'Reject paint iteration',
      icon: 'xmark',
      action: () => this.rejectIteration(),
      visible: () => this.isCreator && this.hasUnconfirmedIteration,
    },
    {
      text: 'Toggle canvas pattern',
      icon: 'game-board',
      action: () => this.toggleCanvasPattern(),
      visible: () => true,
    },
    {
      text: 'View iterations',
      icon: 'layer-group',
      action: () => this.viewIterations(),
      visible: () => !this.canPaint,
    },
  ];

  constructor(
    activatedRoute: ActivatedRoute,
    apiService: ApiService,
    router: Router,
    dialogService: DialogService,
    lobbyLockService: LobbyLockService,
    userInfoService: UserInfoService,
    deviceService: DeviceDetectorService
  ) {
    this._activatedRoute = activatedRoute;
    this._apiService = apiService;
    this._router = router;
    this._dialogService = dialogService;
    this._lobbyLockService = lobbyLockService;
    this._userInfoService = userInfoService;
    this._deviceService = deviceService;

    this.lobby = this._activatedRoute.snapshot.data.lobby;

    this.canvasSettings = {
      canvasPattern: true,
      width: this.lobby.settings.width,
      height: this.lobby.settings.height,
      maxPixels: this.lobby.settings.maxPixels,
    };

    this.prepareLobbyFields();

    const inviteCode = (activatedRoute.snapshot.queryParams.invite ??
      localStorage.getItem(`invite_${this.lobby.id}`)) as string | undefined;
    if (inviteCode) {
      localStorage.setItem(`invite_${this.lobby.id}`, inviteCode);
      this._apiService
        .lobbyControllerValidateInvite({
          body: {
            inviteCode,
            lobbyId: this.lobby.id,
          },
        })
        .then(res => {
          if (res.isValid) {
            this._inviteCode = inviteCode;
          } else {
            this.invalidateInviteCode();
          }
        });
    }
    const creatorSecret = activatedRoute.snapshot.queryParams.creatorSecret as string | undefined;
    if (creatorSecret) {
      this._apiService
        .lobbyControllerValidateCreator({
          body: {
            lobbyId: this.lobby.id,
          },
        })
        .then(res => {
          if (res.isValid) {
            this.resetLobby();
          }
        });
    }

    const confirmed = activatedRoute.snapshot.queryParams.confirmed ?? false;
    const rejected = activatedRoute.snapshot.queryParams.rejected ?? false;

    if (confirmed || rejected) {
      this._lobbyLockService.unlock(this.lobby.id);

      this._dialogService.showComponentDialog(
        ConfirmedOrRejectedComponent,
        c => (c.rejected = rejected)
      );

      this._router.navigate([], {
        relativeTo: this._activatedRoute,
        queryParams: { confirmed: null, rejected: null },
        queryParamsHandling: 'merge',
      });
    }

    if (this.isMobile) {
      this._dialogService.showComponentDialog(NoMobileComponent);
    }
  }

  public get isMobile(): boolean {
    return this._deviceService.isMobile();
  }

  public get pixelsLeft() {
    if (this.isCreator) {
      return 1; // Creator can always paint
    }
    return (this.lobby.settings.maxPixels ?? 100) - this.drawCount;
  }

  public toggleCanvasPattern() {
    this.canvasSettings = {
      ...this.canvasSettings,
      canvasPattern: !this.canvasSettings.canvasPattern,
    };
  }
  private resetLayer(layer: WritableSignal<Layer>) {
    layer.update(l => ({
      ...l,
      pixels: new Array(this.lobby.settings.height)
        .fill(false)
        .map(() => new Array(this.lobby.settings.width).fill(false)),
    }));
  }

  private resetDrawLayer() {
    this.resetLayer(this._drawLayer);
  }

  private prepareLobbyFields() {
    this.resetDrawLayer();
    this.resetLayer(this._draftLayer);
    this.resetLayer(this._committedLayer);

    this._draftLayer.update(l => {
      const unconfirmedIteration = this.lobby.pixelIterations.find(x => !x.confirmed);
      if (unconfirmedIteration) {
        unconfirmedIteration.pixels.forEach(ip => {
          l.pixels[ip.x][ip.y] = true;
        });
      } else {
        l.pixels = new Array(this.lobby.settings.height)
          .fill(false)
          .map(() => new Array(this.lobby.settings.width).fill(false));
      }
      return l;
    });
    this._committedLayer.update(l => {
      this.lobby.pixelIterations
        .filter(x => x.confirmed)
        .forEach(i => {
          i.pixels.forEach(ip => {
            l.pixels[ip.x][ip.y] = true;
          });
        });
      return l;
    });
  }

  public ngOnInit() {
    this._lobbyLockService.lookingAtLobby(this.lobby.id);
    this.listenForLobbyLocked();
    this.listenForLobbyReserved();
    this.listenForReservationTime();

    if (this._inviteCode) {
      setTimeout(() => {
        if (!this._userInfoService.initialized) {
          this.getUserDetails();
        }
      });
    }
  }

  private listenForReservationTime() {
    this._lobbyLockService
      .reservationTime()
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this._editTimeLeft = data.timeLeft;
        if (this._editTimeLeft > 0) {
          const editMinutes = Math.floor(this._editTimeLeft / 60);
          const editSeconds = this._editTimeLeft % 60;
          this.editTimeLeftLabel = `${editMinutes < 10 ? '0' : ''}${editMinutes}:${
            editSeconds < 10 ? '0' : ''
          }${editSeconds}`;
        } else {
          this.editTimeLeftLabel = '';
          if (!this._timeUpComponent) {
            this._timeUpComponent = this._dialogService.showComponentDialog(TimeUpComponent);
            this._timeUpComponent.discard.subscribe(() => {
              this._lobbyLockService.discardDrawing(this.lobby.id);
            });
            this._timeUpComponent.upload.subscribe(() => {
              this.commitIteration();
              this._timeUpComponent?.close();
              this._timeUpComponent = undefined;
            });
          }
          const timeLeft = data.timeLeft + 30;
          this._timeUpComponent.gracePeriodTimeLeft = timeLeft >= 0 ? timeLeft : 0;
        }
      });
  }

  private listenForLobbyReserved() {
    this._lobbyLockService
      .lobbyReserved()
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this.isLockedByMe = data.isReserved;
        if (!this.isLockedByMe) {
          this.resetLobby();
        }
      });
  }

  private listenForLobbyLocked() {
    this._lobbyLockService
      .lobbyLocked()
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this._apiService.lobbyControllerGetLobby({ lobbyId: this.lobby.id }).then(l => {
          this.isLockedBySomebodyElse = data.isLocked;
          this.isLockedByName = data.lockedBy ?? 'Owner';
          this.lobby = l;
          this.prepareLobbyFields();
          this.drawLobby();
        });
      });
  }

  private async getUserDetails() {
    const dialog = this._dialogService.showComponentDialog(UserInfoComponent, c => {
      c.canDoLater = !this.isCreator;
    });

    const result = await dialog.result;
    return result;
  }

  private resetLobby() {
    this.invalidateInviteCode();
    this.resetDrawLayer();
    this.drawLobby();
    this._timeUpComponent?.close();
    this._timeUpComponent = undefined;
  }

  public ngAfterViewInit(): void {
    this.drawLobby();
  }

  private viewIterations(): void {
    this._router.navigate(['lobby', safeLobbyName(this.lobby.name), this.lobby.id, 'iterations']);
  }

  private invalidateInviteCode() {
    this._inviteCode = undefined;
    localStorage.removeItem(`invite_${this.lobby.id}`);
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: { invite: null },
      queryParamsHandling: 'merge', // to replace all query params by provided ones (invite = null)
    });
  }

  private drawLobby() {}

  public get width(): number {
    return this.lobby.settings.width!;
  }

  public get height(): number {
    return this.lobby.settings.height!;
  }

  public get isCreator(): boolean {
    return !!this.lobby.isCreator;
  }

  public get canPaint(): boolean {
    return !!this.isLockedByMe;
  }

  public get canStartToPaint(): boolean {
    return (
      !this.isLockedByMe &&
      !!this._inviteCode &&
      !this.isLockedBySomebodyElse &&
      !this.hasUnconfirmedIteration
    );
  }

  public get hasUnconfirmedIteration(): boolean {
    return this.lobby.pixelIterations.some(x => !x.confirmed);
  }

  public get hoveredCoordinates(): string {
    if (this.hoveredCoords) {
      return `${this.hoveredCoords[0] + 1} | ${this.hoveredCoords[1] + 1}`;
    } else {
      return '';
    }
  }

  private showInviteDialog() {
    const dialog = this._dialogService.showComponentDialog(InviteCodeComponent);
    this.generateInvite(dialog);
    dialog.newInviteCode.subscribe(() => {
      this.generateInvite(dialog, true);
    });
  }

  private generateInvite(dialog: InviteCodeComponent, copyCode: boolean = false) {
    this._apiService
      .lobbyControllerGenerateInvite({
        body: {
          lobbyId: this.lobby.id,
        },
      })
      .then(code => {
        const origin = window.location.origin;
        const codeToCopy = `${origin}/lobby/${safeLobbyName(this.lobby.name)}/${
          this.lobby.id
        }?invite=${code.inviteCode}`;
        dialog.setCopyText(codeToCopy, copyCode);
      });
  }

  private resetImage() {
    this.resetDrawLayer();
    this.drawCount = 0;
    this.drawLobby();
  }

  private commitIteration(): void {
    this.sendIncrementToServer(this._userInfoService.email, this._userInfoService.name);
  }

  private async sendIncrementToServer(contributorEmail: string, contributorName: string) {
    const newPixels = pixelArrayToIncrementPixel(this._drawLayer().pixels);
    await this._apiService.lobbyControllerAddPointsToLobby({
      body: {
        email: contributorEmail,
        inviteCode: this._inviteCode,
        lobbyId: this.lobby.id,
        name: contributorName,
        pixels: newPixels,
      },
    });

    this._lobbyLockService.unlock(this.lobby.id);

    this.invalidateInviteCode();
    this.isLockedByMe = false;
    this.editTimeLeftLabel = '';
  }

  private async startToPaint() {
    if (this.isMobile) {
      this._dialogService.showComponentDialog(NoMobileComponent);
      return;
    }

    if (!this.isLockedBySomebodyElse) {
      if (!this._userInfoService.initialized) {
        const gotDetails = await this.getUserDetails();
        if (!gotDetails) {
          return;
        }
      }
      this.explainControlsBeforeStart = true;
      this.tutorialVisible = true;
    }
  }

  private acceptIteration() {
    this.acceptOrRejectIteration(true);
  }

  private rejectIteration() {
    this.acceptOrRejectIteration(false);
  }

  private async acceptOrRejectIteration(accept: boolean) {
    await this._apiService.lobbyControllerConfirmIncrement({
      body: {
        accept,
        lobbyId: this.lobby.id,
      },
    });
    const l = await this._apiService.lobbyControllerGetLobby({
      lobbyId: this.lobby.id,
    });
    this.lobby = l;
    this.prepareLobbyFields();
    this.drawLobby();
    this._lobbyLockService.unlock(this.lobby.id);
  }

  public hideTutorial() {
    if (this.explainControlsBeforeStart) {
      this.explainControlsBeforeStart = false;
      if (!this.isLockedBySomebodyElse) {
        if (!this._inviteCode) {
          throw new Error('Invite code is not set');
        }
        this._lobbyLockService.lock(this.lobby.id, this._inviteCode);
      }
    }
    this.tutorialVisible = false;
  }

  public showTutorial() {
    this.tutorialVisible = true;
  }
}
