import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IncrementPixel } from '../.api/models/increment-pixel';
import { LobbyResponse } from '../.api/models/lobby-response';
import { ApiService } from '../.api/services/api.service';
import { ActionItem } from '../models/action-item.model';
import { LobbyCacheService } from '../services/lobby-cache.service';

@Component({
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements AfterViewInit {
  private readonly _activatedRoute: ActivatedRoute;
  private readonly _apiService: ApiService;
  private readonly _lobbyCacheService: LobbyCacheService;
  private readonly _router: Router;

  public lobby: LobbyResponse;
  private readonly _lobbyImg: boolean[][];
  private readonly _originalLobbyImg: boolean[][];
  private _inviteCode?: string;
  private readonly _creatorToken?: string;

  @ViewChild('canvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true })
  canvasContainer?: ElementRef<HTMLDivElement>;

  private _ctx?: CanvasRenderingContext2D;
  public zoom: number = 1;
  private _dragging: boolean = false;
  private _drawing: boolean = false;
  private _erasing: boolean = false;
  public offsetX: number = 0;
  public offsetY: number = 0;

  public showCodeCopyPopup: boolean = false;
  public codeToCopy?: string;

  public actionItems: ActionItem[] = [
    {
      text: 'Create new invite link',
      icon: 'share-alt',
      action: () => this.createInvite(),
      visible: () => this.isCreator
    },
    {
      text: 'Submit paint iteration',
      icon: 'layer-plus',
      action: () => this.commitIteration(),
      visible: () => this.canPaint
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
      text: 'View iterations',
      icon: 'layer-group',
      action: () => this.viewIterations(),
      visible: () => true
    }
  ];

  constructor(activatedRoute: ActivatedRoute, apiService: ApiService, lobbyCacheService: LobbyCacheService, router: Router) {
    this._activatedRoute = activatedRoute;
    this._apiService = apiService;
    this._lobbyCacheService = lobbyCacheService;
    this._router = router;

    this.lobby = this._activatedRoute.snapshot.data.lobby;

    this._lobbyImg = new Array(this.lobby.settings.height)
      .fill(false)
      .map(() => new Array(this.lobby.settings.width).fill(false));

    this.lobby.pixelIterations.forEach(i => {
      i.pixels.forEach(ip => {
        this._lobbyImg[ip.x][ip.y] = true;
      });
    });

    this._originalLobbyImg = JSON.parse(JSON.stringify(this._lobbyImg)) as boolean[][];

    const inviteCode = activatedRoute.snapshot.queryParams.invite as string | undefined;
    if (inviteCode) {
      this._apiService
        .lobbyControllerValidateInvite({
          body: {
            inviteCode,
            lobbyId: this.lobby.id
          }
        })
        .subscribe(res => {
          if (res.isValid) {
            this._inviteCode = inviteCode;
          } else {
            this.invalidateInviteCode();
          }
        });
    }

    const creatorToken = this._lobbyCacheService.getCache(this.lobby.id).creatorToken;
    if (creatorToken) {
      this._creatorToken = creatorToken;
    }
  }

  private viewIterations(): void {
    this._router.navigate(['lobby', this.lobby.id, 'iterations']);
  }

  private invalidateInviteCode() {
    this._inviteCode = undefined;
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: { invite: null },
      queryParamsHandling: 'merge' // remove to replace all query params by provided
    });
  }

  public ngAfterViewInit(): void {
    this.drawLobby();
  }

  private drawLobby() {
    if (!this.canvas || !this.canvasContainer) {
      throw new Error('Canvas or canvasContainer not initialized yet');
    }
    this._ctx = this.canvas.nativeElement.getContext('2d')!;
    this._ctx.fillStyle = '#ffffff';
    this._ctx.fillRect(0, 0, this.width, this.height);
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if ((x + y) % 2 === 0) {
          this._ctx.fillStyle = '#a5a5a5';
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

  public get width(): number {
    return this.lobby.settings.width!;
  }

  public get height(): number {
    return this.lobby.settings.height!;
  }

  public get isCreator(): boolean {
    return !!this._creatorToken;
  }

  public get visibleActions(): ActionItem[] {
    return this.actionItems.filter(x => x.visible());
  }

  private get canPaint(): boolean {
    return !!this._inviteCode;
  }

  private get hasUnconfirmedIteration(): boolean {
    return this.lobby.pixelIterations.some(x => !x.confirmed);
  }

  private createInvite() {
    this.showCodeCopyPopup = true;
    this._apiService
      .lobbyControllerGenerateInvite({
        body: {
          creatorToken: this._creatorToken!,
          lobbyId: this.lobby.id
        }
      })
      .subscribe(code => {
        const origin = window.location.origin;
        this.codeToCopy = `${origin}/lobby/${this.lobby.id}?invite=${code.inviteCode}`;
      });
  }

  private commitIteration(): void {
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
    this._apiService
      .lobbyControllerAddPointsToLobby({
        body: {
          email: 'test@test.test',
          inviteCode: this._inviteCode!,
          lobbyId: this.lobby.id,
          name: 'My Name',
          pixels: newPixels
        }
      })
      .subscribe();

    this.invalidateInviteCode();
  }

  private acceptIteration() {
    this.acceptOrRejectIteration(true);
  }
  private rejectIteration() {
    this.acceptOrRejectIteration(false);
  }

  private acceptOrRejectIteration(accept: boolean) {
    this._apiService
      .lobbyControllerConfirmIncrement({
        body: {
          accept,
          creatorToken: this._creatorToken!,
          lobbyId: this.lobby.id
        }
      })
      .subscribe(() => {
        this._apiService.lobbyControllerGetLobby({ lobbyId: this.lobby.id }).subscribe(l => {
          this.lobby = l;
          this.drawLobby();
        });
      });
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
        this.draw(event.offsetX, event.offsetY, this._erasing);
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

  private draw(rawX: number, rawY: number, erase: boolean) {
    this._ctx?.restore();
    const x = Math.floor((rawX / this.canvas!.nativeElement.clientWidth) * this.width);
    const y = Math.floor((rawY / this.canvas!.nativeElement.clientHeight) * this.height);

    if (!this._originalLobbyImg[x][y]) {
      if (this._lobbyImg[x][y] !== !erase) {
        this._lobbyImg[x][y] = !erase;
        if (erase) {
          if ((x + y) % 2 === 0) {
            this._ctx!.fillStyle = '#a5a5a5';
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
      this.draw(event.offsetX, event.offsetY, this._erasing);
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
}
