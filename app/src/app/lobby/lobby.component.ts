import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { IncrementPixel } from '../.api/models/increment-pixel';
import { LobbyResponse } from '../.api/models/lobby-response';
import { ApiService } from '../.api/services/api.service';
import { ActionItem } from '../models/action-item.model';
import { InviteCodeComponent } from '../dialogs/invite-code/invite-code.component';
import { DialogService } from '../services/dialog.service';
import { IdService } from '../services/id.service';
import { LobbyLockService } from '../services/lobby-lock.service';
import { IncrementDetailsComponent } from '../dialogs/increment-details/increment-details.component';
import { UserInfoService } from '../services/user-info.service';
import { ConfirmedOrRejectedComponent } from '../dialogs/confirmed-or-rejected/confirmed-or-rejected.component';

const canvasPatternColor = '#e3e3e3';

@UntilDestroy()
@Component({
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements AfterViewInit, OnInit {
  private readonly _activatedRoute: ActivatedRoute;
  private readonly _apiService: ApiService;
  private readonly _idService: IdService;
  private readonly _router: Router;
  private readonly _dialogService: DialogService;
  private readonly _lobbyLockService: LobbyLockService;
  private readonly _userInfoService: UserInfoService;

  private _lobbyImg!: boolean[][];
  private _originalLobbyImg!: boolean[][];
  private _inviteCode?: string;
  private _dragging: boolean = false;
  private _drawing: boolean = false;
  private _erasing: boolean = false;
  private _lastDrawX: number = 0;
  private _lastDrawY: number = 0;
  private _canvasPattern: boolean = true;
  private _drawnCount: number = 0;
  private _editTimeLeft: number = 0;

  private _ctx?: CanvasRenderingContext2D;
  @ViewChild('canvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true })
  canvasContainer?: ElementRef<HTMLDivElement>;

  public lobby: LobbyResponse;
  public isLockedByMe: boolean = false;
  public isLockedBySomebodyElse: boolean = false;
  public zoom: number = 1;
  public offsetX: number = 0;
  public offsetY: number = 0;
  public editTimeLeftLabel: string = '';
  public tutorialVisible: boolean;
  public showControls: boolean;

  public actionItems: ActionItem[] = [
    {
      text: 'Create new invite link',
      icon: 'share-alt',
      action: () => this.showInviteDialog(),
      visible: () => this.isCreator && !this.canPaint
    },
    {
      text: 'Submit paint iteration',
      icon: 'layer-plus',
      action: () => this.commitIteration(),
      visible: () => this.canPaint
    },
    {
      text: 'Start Painting',
      icon: 'paint-brush-fine',
      action: () => this.startToPaint(),
      visible: () => this.canStartToPaint
    },
    {
      text: 'Accept paint iteration',
      icon: 'check',
      action: () => this.acceptIteration(),
      visible: () => this.isCreator && this.hasUnconfirmedIteration
    },
    {
      text: 'Reject paint iteration',
      icon: 'xmark',
      action: () => this.rejectIteration(),
      visible: () => this.isCreator && this.hasUnconfirmedIteration
    },
    {
      text: 'Toggle Canvas Pattern',
      icon: 'game-board',
      action: () => this.toggleCanvasPattern(),
      visible: () => true
    },
    {
      text: 'View iterations',
      icon: 'layer-group',
      action: () => this.viewIterations(),
      visible: () => !this.canPaint
    }
  ];

  constructor(
    activatedRoute: ActivatedRoute,
    apiService: ApiService,
    idService: IdService,
    router: Router,
    dialogService: DialogService,
    lobbyLockService: LobbyLockService,
    userInfoService: UserInfoService
  ) {
    this._activatedRoute = activatedRoute;
    this._apiService = apiService;
    this._idService = idService;
    this._router = router;
    this._dialogService = dialogService;
    this._lobbyLockService = lobbyLockService;
    this._userInfoService = userInfoService;

    this.lobby = this._activatedRoute.snapshot.data.lobby;

    this.prepareLobbyFields();

    this.showControls = !(localStorage.getItem('showControls') === 'false');
    this.tutorialVisible = this.showControls;

    const inviteCode = (activatedRoute.snapshot.queryParams.invite ?? localStorage.getItem(`invite_${this.lobby.id}`)) as
      | string
      | undefined;
    if (inviteCode) {
      localStorage.setItem(`invite_${this.lobby.id}`, inviteCode);
      this._apiService
        .lobbyControllerValidateInvite({
          body: {
            inviteCode,
            lobbyId: this.lobby.id
          }
        })
        .then(res => {
          if (res.isValid) {
            this._inviteCode = inviteCode;
          } else {
            this.invalidateInviteCode();
          }
        });
    }

    const confirmed = activatedRoute.snapshot.queryParams.confirmed ?? false;
    const rejected = activatedRoute.snapshot.queryParams.rejected ?? false;

    if (confirmed || rejected) {
      this._lobbyLockService.unlock(this.lobby.id);

      this._dialogService.showComponentDialog(ConfirmedOrRejectedComponent, c => (c.rejected = rejected));

      this._router.navigate([], {
        relativeTo: this._activatedRoute,
        queryParams: { confirmed: null, rejected: null },
        queryParamsHandling: 'merge'
      });
    }
  }

  public get pixelsLeft() {
    return (this.lobby.settings.maxPixels ?? 100) - this._drawnCount;
  }

  private prepareLobbyFields() {
    this._lobbyImg = new Array(this.lobby.settings.height)
      .fill(false)
      .map(() => new Array(this.lobby.settings.width).fill(false));

    this.lobby.pixelIterations.forEach(i => {
      i.pixels.forEach(ip => {
        this._lobbyImg[ip.x][ip.y] = true;
      });
    });

    this._originalLobbyImg = JSON.parse(JSON.stringify(this._lobbyImg)) as boolean[][];
  }

  public ngOnInit() {
    this._lobbyLockService.lookingAtLobby(this.lobby.id);
    this._lobbyLockService
      .lobbyLocked()
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this._apiService.lobbyControllerGetLobby({ lobbyId: this.lobby.id, uid: this._idService.id }).then(l => {
          this.isLockedBySomebodyElse = data.isLocked;
          this.lobby = l;
          this.prepareLobbyFields();
          this.drawLobby();
        });
      });
    this._lobbyLockService
      .lobbyReserved()
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this.isLockedByMe = data.isReserved;
        if (!this.isLockedByMe) {
          this.resetLobby();
        }
      });

    this._lobbyLockService
      .reservationTime()
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this._editTimeLeft = data.timeLeft;
        if (this._editTimeLeft > 0) {
          const editMinutes = Math.floor(this._editTimeLeft / 60);
          const editSeconds = this._editTimeLeft % 60;
          this.editTimeLeftLabel = `${editMinutes < 10 ? '0' : ''}${editMinutes}:${editSeconds < 10 ? '0' : ''}${editSeconds}`;
        } else {
          this.editTimeLeftLabel = '';
        }
      });

    if (this._inviteCode) {
      setTimeout(() => {
        if (!this._userInfoService.initialized) {
          this.getUserDetails();
        }
      });
    }
  }

  private async getUserDetails() {
    const dialog = this._dialogService.showComponentDialog(IncrementDetailsComponent, c => {
      c.gotMail = this._userInfoService.email !== '';
      c.canDoLater = !this.isCreator;
    });

    const result = await dialog.result;
    if (result) {
      this._userInfoService.name = dialog.name;
      this._userInfoService.email ||= dialog.email;
      return true;
    }
    return false;
  }

  private resetLobby() {
    this._lobbyImg = JSON.parse(JSON.stringify(this._originalLobbyImg)) as boolean[][];
    this.drawLobby();
  }

  public ngAfterViewInit(): void {
    this.drawLobby();
  }

  private viewIterations(): void {
    this._router.navigate(['lobby', this.lobby.id, 'iterations']);
  }

  private invalidateInviteCode() {
    this._inviteCode = undefined;
    localStorage.removeItem(`invite_${this.lobby.id}`);
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: { invite: null },
      queryParamsHandling: 'merge' // to replace all query params by provided ones (invite = null)
    });
  }

  private drawLobby() {
    if (!this.canvas || !this.canvasContainer) {
      throw new Error('Canvas or canvasContainer not initialized yet');
    }
    this._ctx = this.canvas.nativeElement.getContext('2d')!;
    this._ctx.fillStyle = '#ffffff';
    this._ctx.fillRect(0, 0, this.width, this.height);
    if (this._canvasPattern) {
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          if ((x + y) % 2 === 0) {
            this._ctx.fillStyle = canvasPatternColor;
            this._ctx?.fillRect(x, y, 1, 1);
          }
        }
      }
    }
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this._lobbyImg[x][y]) {
          this._ctx.fillStyle = 'black';
          this._ctx?.fillRect(x, y, 1, 1);
        }
      }
    }
    this.lobby.pixelIterations.forEach(x => {
      this._ctx!.fillStyle = x.confirmed ? 'black' : 'green';
      x.pixels.forEach(p => {
        this._ctx?.fillRect(p.x, p.y, 1, 1);
      });
    });
  }

  private toggleCanvasPattern(): void {
    this._canvasPattern = !this._canvasPattern;
    this.drawLobby();
  }

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
    return !this.isLockedByMe && !!this._inviteCode && !this.isLockedBySomebodyElse && !this.hasUnconfirmedIteration;
  }

  public get hasUnconfirmedIteration(): boolean {
    return this.lobby.pixelIterations.some(x => !x.confirmed);
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
          uid: this._idService.id,
          lobbyId: this.lobby.id
        }
      })
      .then(code => {
        const origin = window.location.origin;
        const codeToCopy = `${origin}/lobby/${this.lobby.id}?invite=${code.inviteCode}`;
        dialog.setCopyText(codeToCopy, copyCode);
      });
  }

  private commitIteration(): void {
    this.sendIncrementToServer(this._userInfoService.email, this._userInfoService.name);
  }

  private async sendIncrementToServer(contributorEmail: string, contributorName: string) {
    const newPixels: IncrementPixel[] = [];
    for (let x = 0; x < this._lobbyImg.length; x++) {
      const row = this._lobbyImg[x];
      const originalRow = this._originalLobbyImg[x];
      for (let y = 0; y < row.length; y++) {
        const originalElement = originalRow[y];
        const element = row[y];
        if (element && !originalElement) {
          newPixels.push({ x, y });
        }
      }
    }
    await this._apiService.lobbyControllerAddPointsToLobby({
      body: {
        email: contributorEmail,
        inviteCode: this._inviteCode,
        lobbyId: this.lobby.id,
        name: contributorName,
        pixels: newPixels,
        uid: this._idService.id
      }
    });

    this._lobbyLockService.unlock(this.lobby.id);

    this.invalidateInviteCode();
    this.isLockedByMe = false;
    this.editTimeLeftLabel = '';
  }

  private async startToPaint() {
    if (!this.isLockedBySomebodyElse) {
      if (!this._userInfoService.initialized) {
        const gotDetails = await this.getUserDetails();
        if (!gotDetails) {
          return;
        }
      }
      this._lobbyLockService.lock(this.lobby.id);
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
        uid: this._idService.id,
        lobbyId: this.lobby.id
      }
    });
    const l = await this._apiService.lobbyControllerGetLobby({ lobbyId: this.lobby.id, uid: this._idService.id });
    this.lobby = l;
    this.prepareLobbyFields();
    this.drawLobby();
    this._lobbyLockService.unlock(this.lobby.id);
  }

  public gotWheel(event: WheelEvent) {
    if (event.deltaY < 0) {
      this.zoom *= 1.1;
    } else {
      this.zoom *= 0.9;
    }
    if (this.zoom < 1) {
      this.zoom = 1;
    } else if (this.zoom > 20) {
      this.zoom = 20;
    }
    this.fixOffsets();
    event.preventDefault();
  }

  public mouseDown(event: MouseEvent) {
    this._dragging = event.button === 1;
    if (this.canPaint) {
      this._drawing = event.button === 0;
      this._erasing = event.button === 2;
      if (this._drawing || this._erasing) {
        this.draw(event.offsetX, event.offsetY, this._erasing, true);
      }
    }
    event.preventDefault();
  }
  public mouseUp(event: MouseEvent) {
    this._dragging = false;
    this._drawing = false;
    this._erasing = false;
    event.preventDefault();
  }
  public mouseLeave() {
    this._dragging = false;
    this._drawing = false;
    this._erasing = false;
  }

  private draw(rawX: number, rawY: number, erase: boolean, startPoint: boolean) {
    this._ctx?.restore();
    const x = Math.floor((rawX / this.canvas!.nativeElement.clientWidth) * this.width);
    const y = Math.floor((rawY / this.canvas!.nativeElement.clientHeight) * this.height);
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }
    this.drawPixel(x, y, erase);

    if (startPoint) {
      this._lastDrawX = x;
      this._lastDrawY = y;
      return;
    }
    const deltaX = x - this._lastDrawX;
    const deltaY = y - this._lastDrawY;

    const largerDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));

    for (let i = 0; i < largerDelta; i++) {
      const x_ = this._lastDrawX + Math.floor((deltaX / largerDelta) * i);
      const y_ = this._lastDrawY + Math.floor((deltaY / largerDelta) * i);
      this.drawPixel(x_, y_, erase);
    }
    this._lastDrawX = x;
    this._lastDrawY = y;
  }

  private drawPixel(x: number, y: number, erase: boolean) {
    if (!erase && this.pixelsLeft <= 0) {
      return;
    }
    if (!this._originalLobbyImg[x][y]) {
      if (this._lobbyImg[x][y] !== !erase) {
        this._lobbyImg[x][y] = !erase;
        this._drawnCount += erase ? -1 : 1;
        if (erase) {
          if ((x + y) % 2 === 0) {
            this._ctx!.fillStyle = canvasPatternColor;
          } else {
            this._ctx!.fillStyle = '#ffffff';
          }
        } else {
          this._ctx!.fillStyle = 'black';
        }
        this._ctx?.fillRect(x, y, 1, 1);
      }
    }
  }

  public mouseMove(event: MouseEvent) {
    if (this._dragging) {
      this.offsetX += event.movementX / this.zoom;
      this.offsetY += event.movementY / this.zoom;
      this.fixOffsets();
    } else if (this._drawing || this._erasing) {
      this.draw(event.offsetX, event.offsetY, this._erasing, false);
    }
  }

  private fixOffsets() {
    this._ctx?.save();
    const canvasWidth = this.canvas!.nativeElement.clientWidth;
    const actualCanvasWidth = canvasWidth * this.zoom;
    const maxOffsetX = (actualCanvasWidth - canvasWidth) / 2 / this.zoom;
    const canvasHeight = this.canvas!.nativeElement.clientHeight;
    const actualCanvasHeight = canvasHeight * this.zoom;
    const maxOffsetY = (actualCanvasHeight - canvasHeight) / 2 / this.zoom;
    if (this.offsetX > maxOffsetX) {
      this.offsetX = maxOffsetX;
    } else if (this.offsetX < -maxOffsetX) {
      this.offsetX = -maxOffsetX;
    }
    if (this.offsetY > maxOffsetY) {
      this.offsetY = maxOffsetY;
    } else if (this.offsetY < -maxOffsetY) {
      this.offsetY = -maxOffsetY;
    }
  }

  public hideTutorial() {
    if (this.showControls) {
      this.showControls = false;
      localStorage.setItem('showControls', 'false');
    }
    this.tutorialVisible = false;
  }

  public showTutorial() {
    this.tutorialVisible = true;
  }
}
