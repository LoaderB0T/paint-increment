import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyResponse } from '../.api/models/lobby-response';
import { ActionItem } from '../models/action-item.model';
import * as JsZip from 'jszip';
import { saveAs } from 'file-saver';
import { downloadBack } from './rendering/back';
import { downloadFront } from './rendering/front';

@Component({
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements AfterViewInit {
  private readonly _activatedRoute: ActivatedRoute;
  private readonly _router: Router;
  public lobby: LobbyResponse;

  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;

  public color = '#ff0042';
  public transparent = false;
  public columns = '5';

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
    }
  ];

  constructor(activatedRoute: ActivatedRoute, router: Router) {
    this._activatedRoute = activatedRoute;
    this._router = router;

    this.lobby = this._activatedRoute.snapshot.data.lobby as LobbyResponse;
  }

  public get width(): number {
    return this.lobby.settings.width!;
  }

  public get height(): number {
    return this.lobby.settings.height!;
  }

  public ngAfterViewInit(): void {
    for (let i = 0; i < this.lobby.pixelIterations.length; i++) {
      const ctx = this.canvas.nativeElement.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, this.lobby.settings.width!, this.lobby.settings.height!);
      for (let j = 0; j <= i; j++) {
        ctx.fillStyle = j === i ? 'green' : 'black';
        const iteration = this.lobby.pixelIterations[j];
        iteration.pixels.forEach(p => {
          ctx.fillRect(p.x, p.y, 1, 1);
        });
      }
    }
  }

  public download() {
    downloadBack(this.lobby, this.color, this.transparent, Number.parseInt(this.columns));
    downloadFront(this.lobby, this.color, this.transparent);
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
