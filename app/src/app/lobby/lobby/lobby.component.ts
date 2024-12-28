import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyResponse, LobbyService } from '@shared/api';
import { ButtonComponent, DialogService } from '@shared/controls';
import { injectI18n } from '@shared/i18n';
import { StorageService } from '@shared/shared/storage';
import { UserInfoService } from '@shared/shared/user-info';
import { assertBody, pixelArrayToIncrementPixel, safeLobbyName } from '@shared/utils';
import { map } from 'rxjs';

import { LobbyLockService } from './lobby-lock.service';
import { InviteCodeComponent } from '../../dialog/invite-code/invite-code.component';
import { CanvasComponent, CanvasSettings, getPixelArray, Layer } from '../canvas/canvas.component';

type LockeyBy = {
  kind: 'me' | 'other' | 'none';
  name?: string;
};

type Store = {
  inviteCodes?: {
    [lobbyId: string]: string;
  };
};

@Component({
  imports: [ButtonComponent, CanvasComponent],
  selector: 'awd-lobby',
  templateUrl: 'lobby.component.html',
  styleUrls: ['lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyComponent implements OnInit {
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _lobbyService = inject(LobbyService);
  private readonly _lobbyLockService = inject(LobbyLockService);
  private readonly _userInfoService = inject(UserInfoService);
  private readonly _dialogService = inject(DialogService);
  private readonly _store = inject(StorageService).init<Store>('lobby', {});
  protected readonly i18n = injectI18n();
  protected readonly lobby = signal(
    this._activatedRoute.snapshot.parent?.data['lobby'] as LobbyResponse
  );
  protected readonly inviteCode = computed(
    () => this._store.valueSig()?.inviteCodes?.[this.lobby().id]
  );
  protected readonly hasUnconfirmedContribution = computed(() =>
    this.lobby().pixelIterations.some(x => !x.confirmed)
  );

  protected readonly drawCount = signal(0);
  protected readonly isDrawing = computed(() => this.lockedInfo().kind === 'me');

  protected readonly settings = computed<CanvasSettings>(() => ({
    canvasPattern: false,
    height: this.lobby().settings.height,
    width: this.lobby().settings.width,
    maxPixels: this.lobby().settings.maxPixels,
  }));
  private readonly _drawLayer = signal<Layer>({
    color: '#000000',
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
  protected readonly layers = computed(() => [
    this._drawLayer(),
    this._draftLayer(),
    this._committedLayer(),
  ]);

  protected get isCreator(): boolean {
    return !!this.lobby().isCreator;
  }

  private readonly _isLocked = toSignal(this._lobbyLockService.lobbyLocked(), {
    initialValue: {
      lockedBy: '',
      isLocked: true,
    },
  });
  private readonly _isLockedByMe = toSignal(
    this._lobbyLockService.lobbyReserved().pipe(map(x => x.isReserved)),
    {
      initialValue: false,
    }
  );
  protected readonly lockedInfo = computed<LockeyBy>(() => {
    const lockedByMe = this._isLockedByMe();
    const isLocked = this._isLocked();

    return {
      kind: lockedByMe ? 'me' : isLocked.isLocked ? 'other' : 'none',
      name: isLocked.lockedBy,
    };
  });

  constructor() {
    this.prepareLayers();

    effect(() => {
      if (!this._isLockedByMe()) {
        this.resetLobby();
      }
    });

    this.initInviteToken();

    this._lobbyLockService
      .reloadLobby()
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.reloadLobby();
      });
  }

  private prepareLayers() {
    this._drawLayer.update(drawLayer => {
      drawLayer.pixels = getPixelArray(this.lobby().settings.width, this.lobby().settings.height);
      return drawLayer;
    });
    this._committedLayer.update(committedLayer => {
      committedLayer.pixels = getPixelArray(
        this.lobby().settings.width,
        this.lobby().settings.height
      );
      this.lobby()
        .pixelIterations.filter(x => x.confirmed)
        .forEach(i => {
          i.pixels.forEach(ip => {
            committedLayer.pixels[ip.x][ip.y] = true;
          });
        });
      return committedLayer;
    });
    this._draftLayer.update(draftLayer => {
      draftLayer.pixels = getPixelArray(this.lobby().settings.width, this.lobby().settings.height);
      this.lobby()
        .pixelIterations.filter(x => !x.confirmed)
        .forEach(i => {
          i.pixels.forEach(ip => {
            draftLayer.pixels[ip.x][ip.y] = true;
          });
        });
      return draftLayer;
    });
  }

  private async initInviteToken() {
    const inviteCode =
      this._activatedRoute.snapshot.queryParams['invite'] ??
      this._store.value?.inviteCodes?.[this.lobby().id];
    if (inviteCode) {
      const response = await this._lobbyService.lobbyControllerValidateInvite({
        body: {
          inviteCode,
          lobbyId: this.lobby().id,
        },
      });
      if (!response.ok) {
        // TODO: handle error
        return;
      }
      const isValid = assertBody(response).isValid;
      if (isValid) {
        this._store.update(store => {
          store.inviteCodes = {
            ...store.inviteCodes,
            [this.lobby().id]: inviteCode,
          };
          return store;
        });
      } else {
        this.invalidateInviteCode();
      }
    }
  }

  public ngOnInit(): void {
    this._lobbyLockService.lookingAtLobby(this.lobby().id);
  }

  private resetLayer(layer: WritableSignal<Layer>) {
    layer.update(l => ({
      ...l,
      pixels: new Array(this.lobby().settings.height)
        .fill(false)
        .map(() => new Array(this.lobby().settings.width).fill(false)),
    }));
  }

  private resetDrawLayer() {
    this.resetLayer(this._drawLayer);
  }

  protected resetImage() {
    this.resetDrawLayer();
    this.drawCount.set(0);
  }

  private resetLobby() {
    this.invalidateInviteCode();
    this.resetDrawLayer();
  }

  private invalidateInviteCode() {
    this._store.update(store => {
      delete store.inviteCodes?.[this.lobby().id];
      return store;
    });
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: { invite: null },
      queryParamsHandling: 'merge', // to replace all query params by provided ones (invite = null)
    });
  }

  protected createInvite() {
    const generateCode = async () => {
      const response = await this._lobbyService.lobbyControllerGenerateInvite({
        body: {
          lobbyId: this.lobby().id,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to generate invite code');
      }
      const inviteCode = assertBody(response).inviteCode;
      const origin = window.location.origin;
      const codeToCopy = `${origin}/lobby/${safeLobbyName(this.lobby().name)}/${
        this.lobby().id
      }?invite=${inviteCode}`;
      return codeToCopy;
    };

    const comp = this._dialogService.showComponentDialog(InviteCodeComponent);
    generateCode().then(code => {
      comp.setCode(code);
    });
  }

  protected navigateHome(): void {
    this._router.navigate(['/']);
  }

  protected startDrawing() {
    const inviteCode = this.inviteCode();
    if (!inviteCode) {
      throw new Error('Invite code is not set');
    }
    this._lobbyLockService.lock(this.lobby().id, inviteCode);
  }

  protected async submitContribution() {
    const contributorEmail = this._userInfoService.email;
    const contributorName = this._userInfoService.name;
    const newPixels = pixelArrayToIncrementPixel(this._drawLayer().pixels);
    await this._lobbyService.lobbyControllerAddPointsToLobby({
      body: {
        email: contributorEmail,
        inviteCode: this.inviteCode(),
        lobbyId: this.lobby().id,
        name: contributorName,
        pixels: newPixels,
      },
    });

    this._lobbyLockService.unlock(this.lobby().id);

    this.invalidateInviteCode();
    await this.triggerReloadLobby();
  }

  protected acceptIteration() {
    this.acceptOrRejectIteration(true);
  }

  protected rejectIteration() {
    this.acceptOrRejectIteration(false);
  }

  private async acceptOrRejectIteration(accept: boolean) {
    await this._lobbyService.lobbyControllerConfirmIncrement({
      body: {
        accept,
        lobbyId: this.lobby().id,
      },
    });
    await this.triggerReloadLobby();
  }

  private async triggerReloadLobby() {
    this._lobbyLockService.doReloadLobby(this.lobby().id);
    await this.reloadLobby();
  }

  private async reloadLobby() {
    const response = await this._lobbyService.lobbyControllerGetLobby({
      lobbyId: this.lobby().id,
      isBrowser: true,
    });
    if (!response.ok) {
      // TODO: handle error
      return;
    }
    const lobby = assertBody(response);
    this.lobby.set(lobby);
    this.prepareLayers();
    Object.assign(this._activatedRoute.snapshot.data['lobby'], lobby);
  }

  protected showHistory() {
    this._router.navigate(['history'], {
      relativeTo: this._activatedRoute,
    });
  }
}
