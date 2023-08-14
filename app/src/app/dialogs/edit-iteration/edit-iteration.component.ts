import { Component, OnInit } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';
import { IterationModel } from '../../.api/models/iteration-model';
import { LobbyResponse } from '../../.api/models/lobby-response';
import { BaseDialog } from '../../models/base-dialog.model';
import { CanvasSettings, Layer } from '../../canvas/canvas.component';

@Component({
  templateUrl: './edit-iteration.component.html',
  styleUrls: ['./edit-iteration.component.scss'],
})
export class EditIterationComponent extends BaseDialog implements OnInit {
  private readonly _result = new Subject<
    { name: string; index: number; delete: boolean; pixels: boolean[][] } | undefined
  >();
  public result = firstValueFrom(this._result);
  public lobby?: LobbyResponse;
  public lobbyLayers: Layer[] = [];
  public canvasSettings!: CanvasSettings;
  public iterationId?: string;
  private _newIndex?: number;
  private _newName?: string;
  private _changed = false;

  constructor() {
    super();
  }

  public ngOnInit(): void {
    const layer: Layer = {
      color: '#000000',
      pixels: new Array(this.height).fill(false).map(() => new Array(this.width).fill(false)),
    };

    const bgLayer: Layer = {
      color: '#FF0042',
      pixels: new Array(this.height).fill(false).map(() => new Array(this.width).fill(false)),
    };

    this.lobby?.pixelIterations
      .filter(i => i.id !== this.iteration.id)
      .forEach(i => {
        i.pixels.forEach(p => {
          bgLayer.pixels[p.x][p.y] = true;
        });
      });

    this.iteration.pixels.forEach(p => {
      layer.pixels[p.x][p.y] = true;
    });

    this.lobbyLayers = [layer, bgLayer];

    this.canvasSettings = {
      canvasPattern: true,
      height: this.height,
      width: this.width,
      maxPixels: 0,
    };
  }

  public onCanvasChanged() {
    this._changed = true;
  }

  public get iteration(): IterationModel {
    if (!this.lobby) {
      throw new Error('Lobby not set');
    }
    if (this.iterationId === undefined) {
      throw new Error('Iteration index not set');
    }
    const iteration = this.lobby.pixelIterations.find(i => i.id === this.iterationId);
    if (!iteration) {
      throw new Error('Iteration not found');
    }
    return iteration;
  }

  public get width(): number {
    return this.lobby?.settings.width ?? 0;
  }

  public get height(): number {
    return this.lobby?.settings.height ?? 0;
  }

  public get newName(): string {
    this._newName ??= this.iteration.name;
    return this._newName;
  }
  public set newName(value: string) {
    this._newName = value;
  }
  public get newIndex(): string {
    this._newIndex ??= this.lobby?.pixelIterations.findIndex(i => i.id === this.iterationId);
    return String(this._newIndex ?? -1);
  }
  public set newIndex(value: string) {
    this._newIndex = Number.parseInt(value, 10);
  }

  public dismiss() {
    this._result.next(undefined);
    this._result.complete();
    this.close();
  }

  public save() {
    this._result.next({
      name: this.newName,
      index: this._newIndex ?? -1,
      delete: false,
      pixels: this._changed ? this.lobbyLayers[0].pixels : [],
    });
    this._result.complete();
    this.close();
  }

  public remove() {
    this._result.next({ name: '', index: -1, delete: true, pixels: [] });
    this._result.complete();
    this.close();
  }
}
