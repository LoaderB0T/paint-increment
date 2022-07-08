import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyResponse } from '../.api/models/lobby-response';
import { ActionItem } from '../models/action-item.model';
import * as JsZip from 'jszip';
import { saveAs } from 'file-saver';
import { renderBack } from './rendering/back';
import { renderFront } from './rendering/front';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements AfterViewInit {
  private readonly _activatedRoute: ActivatedRoute;
  private readonly _router: Router;
  public lobby: LobbyResponse;
  private readonly _canvasSize = new BehaviorSubject<{ width: number; height: number }>({ width: 0, height: 0 });
  public readonly canvasSize$ = this._canvasSize.asObservable();

  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;
  private _color = '#00ff00';
  private _transparent = false;
  private _columns = '5';
  private _showBack = false;
  private _renderYear = true;
  private _renderEdgePixels = true;

  public get color(): string {
    return this._color;
  }
  public set color(value: string) {
    this._color = value;
    this.refreshPreview();
  }
  public get transparent() {
    return this._transparent;
  }
  public set transparent(value) {
    this._transparent = value;
    this.refreshPreview();
  }
  public get columns() {
    return Number.parseInt(this._columns, 10);
  }
  public set columns(value: number) {
    this._columns = `${value}`;
    this.refreshPreview();
  }
  public get renderYear() {
    return this._renderYear;
  }
  public set renderYear(value) {
    this._renderYear = value;
    this.refreshPreview();
  }
  public get renderEdgePixels() {
    return this._renderEdgePixels;
  }
  public set renderEdgePixels(value) {
    this._renderEdgePixels = value;
    this.refreshPreview();
  }

  public actionItems: ActionItem[] = [
    {
      text: 'Back to lobby',
      icon: 'left',
      action: () => this.back(),
      visible: () => true
    },
    {
      text: 'Download Images',
      icon: 'download',
      action: () => this.download(),
      visible: () => true
    },
    {
      text: 'Switch to front',
      icon: 'arrows-repeat',
      action: () => this.flip(),
      visible: () => this._showBack
    },
    {
      text: 'Switch to back',
      icon: 'arrows-repeat',
      action: () => this.flip(),
      visible: () => !this._showBack
    }
  ];

  constructor(activatedRoute: ActivatedRoute, router: Router) {
    this._activatedRoute = activatedRoute;
    this._router = router;

    this.lobby = this._activatedRoute.snapshot.data.lobby as LobbyResponse;
  }

  private flip() {
    this._showBack = !this._showBack;
    this.refreshPreview();
  }

  public get width(): number {
    return this.lobby.settings.width!;
  }

  public get height(): number {
    return this.lobby.settings.height!;
  }

  private refreshPreview() {
    if (this._showBack) {
      renderBack(this.lobby, this.color, this.transparent, this.columns).then(canvas => {
        const ctx = this.canvas.nativeElement.getContext('2d')!;
        this._canvasSize.next({ width: canvas.width, height: canvas.height });
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setTimeout(() => {
          ctx.drawImage(canvas, 0, 0);
        });
      });
    } else {
      renderFront(this.lobby, this.color, this.transparent, this.renderYear, this.renderEdgePixels).then(canvas => {
        const ctx = this.canvas.nativeElement.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this._canvasSize.next({ width: canvas.width, height: canvas.height });
        setTimeout(() => {
          ctx.drawImage(canvas, 0, 0);
        });
      });
    }
  }

  public ngAfterViewInit(): void {
    this.refreshPreview();
  }

  public download() {
    const color = this.color;
    const transparent = this.transparent;
    if (this._showBack) {
      renderBack(this.lobby, color, transparent, this.columns).then(canvas => {
        canvas.toBlob(blob => {
          saveAs(blob!, `${this.lobby.name}_${color}_back${transparent ? '_T' : ''}.png`);
        });
      });
    } else {
      renderFront(this.lobby, color, transparent, this.renderYear, this.renderEdgePixels).then(canvas => {
        canvas.toBlob(blob => {
          saveAs(blob!, `${this.lobby.name}_${color}_front${transparent ? '_T' : ''}.png`);
        });
      });
    }
  }

  private back() {
    this._router.navigate(['lobby', this.lobby.id]);
  }

  private downloadImages(color: string, transparent: boolean) {
    const targetSize = 2048;
    let size = 0;
    while (size < targetSize) {
      size += this.lobby.settings.width!;
    }
    const pixelSize = size / this.lobby.settings.width!;
    const zip = new JsZip();
    for (let i = 0; i < this.lobby.pixelIterations.length; i++) {
      const el = document.createElement('canvas');
      el.width = size;
      el.height = size;
      const ctx = el.getContext('2d')!;

      if (!transparent) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
      }

      for (let j = 0; j <= i; j++) {
        ctx.fillStyle = j === i ? color : 'black';
        const iteration = this.lobby.pixelIterations[j];
        iteration.pixels.forEach(p => {
          ctx.fillRect(p.x * pixelSize, p.y * pixelSize, pixelSize, pixelSize);
        });
      }
      const imgString = el.toDataURL('image/png');

      zip.file(`${i}.png`, imgString.split('base64,')[1], { base64: true });
    }
    zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(content, `${this.lobby.name}_${color}${transparent ? '_T' : ''}.zip`);
    });
  }
}
