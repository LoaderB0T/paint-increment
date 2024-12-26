import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyResponse, LobbyService } from '@shared/api';
import { ButtonComponent } from '@shared/controls/button/button.component';
import { TranslateService } from '@shared/i18n/translate.service';
import { StorageService } from '@shared/shared/storage';
import { UserInfoService } from '@shared/shared/user-info';
import { pixelArrayToIncrementPixel } from '@shared/utils';
import { map } from 'rxjs';

import { LobbyLockService } from './lobby-lock.service';
import { CanvasComponent, CanvasSettings, Layer } from '../canvas/canvas.component';

function getPixelArray(width: number, height: number): boolean[][] {
  return Array.from({ length: width }, () => Array.from({ length: height }, () => false));
}

type LockeyBy = {
  kind: 'me' | 'other' | 'none';
  name?: string;
};

type Store = {
  inviteCode?: string;
};

@Component({
  imports: [ButtonComponent, CanvasComponent],
  selector: 'awd-lobby',
  templateUrl: 'lobby.component.html',
  styleUrls: ['lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyComponent {
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _lobbyService = inject(LobbyService);
  private readonly _lobbyLockService = inject(LobbyLockService);
  private readonly _userInfoService = inject(UserInfoService);
  private readonly _store = inject(StorageService).init<Store>('lobby', {});
  protected readonly i18n = inject(TranslateService).translations;
  protected readonly lobby = this._activatedRoute.snapshot.data['lobby'] as LobbyResponse;
  protected readonly inviteCode = computed(() => this._store.valueSig()?.inviteCode);

  protected readonly drawCount = signal(0);
  protected readonly isDrawing = signal(false);

  protected readonly settings: CanvasSettings = {
    canvasPattern: false,
    height: this.lobby.settings.height,
    width: this.lobby.settings.width,
    maxPixels: this.lobby.settings.maxPixels,
  };
  private readonly _drawLayer = signal<Layer>({
    color: '#000000',
    pixels: getPixelArray(this.settings.width, this.settings.height),
  });
  private readonly _draftLayer = signal<Layer>({
    color: '#000000',
    pixels: getPixelArray(this.settings.width, this.settings.height),
  });
  private readonly _committedLayer = signal<Layer>({
    color: '#000000',
    pixels: getPixelArray(this.settings.width, this.settings.height),
  });
  protected readonly layers = computed(() => [
    this._drawLayer(),
    this._draftLayer(),
    this._committedLayer(),
  ]);

  protected get isCreator(): boolean {
    return !!this.lobby.isCreator;
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
      kind: isLocked.isLocked ? 'other' : lockedByMe ? 'me' : 'none',
      name: isLocked.lockedBy,
    };
  });

  constructor() {
    this._lobbyLockService.lookingAtLobby(this.lobby.id);

    this._committedLayer.update(committedLayer => {
      this.lobby.pixelIterations
        .filter(x => x.confirmed)
        .forEach(i => {
          i.pixels.forEach(ip => {
            committedLayer.pixels[ip.x][ip.y] = true;
          });
        });
      return committedLayer;
    });

    effect(() => {
      if (!this._isLockedByMe()) {
        this.resetLobby();
      }
    });
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
      store.inviteCode = undefined;
      return store;
    });
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: { invite: null },
      queryParamsHandling: 'merge', // to replace all query params by provided ones (invite = null)
    });
  }

  protected createInvite() {
    // todo
  }

  protected navigateHome(): void {
    this._router.navigate(['/']);
  }

  protected startDrawing() {
    const inviteCode = this.inviteCode();
    if (!inviteCode) {
      throw new Error('Invite code is not set');
    }
    this._lobbyLockService.lock(this.lobby.id, inviteCode);
    this.isDrawing.set(true);
  }

  protected async submitContribution() {
    const contributorEmail = this._userInfoService.email;
    const contributorName = this._userInfoService.name;
    const newPixels = pixelArrayToIncrementPixel(this._drawLayer().pixels);
    await this._lobbyService.lobbyControllerAddPointsToLobby({
      body: {
        email: contributorEmail,
        inviteCode: this.inviteCode(),
        lobbyId: this.lobby.id,
        name: contributorName,
        pixels: newPixels,
      },
    });

    this._lobbyLockService.unlock(this.lobby.id);

    this.invalidateInviteCode();
  }
}
