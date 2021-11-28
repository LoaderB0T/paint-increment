import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyResponse } from '../.api/models/lobby-response';
import { ActionItem } from '../models/action-item.model';
import * as JsZip from 'jszip';
import { saveAs } from 'file-saver';
import { DialogService } from '../services/dialog.service';
import { DownloadColorComponent } from '../dialogs/download-color/download-color.component';

@Component({
  templateUrl: './lobby-iterations.component.html',
  styleUrls: ['./lobby-iterations.component.scss']
})
export class LobbyIterationsComponent implements AfterViewInit {
  private readonly _activatedRoute: ActivatedRoute;
  private readonly _dialogService: DialogService;
  private readonly _router: Router;
  public lobby: LobbyResponse;

  @ViewChildren('canvas')
  canvas!: QueryList<ElementRef<HTMLCanvasElement>>;
  public zoomValue: number = 300;

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

  constructor(activatedRoute: ActivatedRoute, dialogService: DialogService, router: Router) {
    this._activatedRoute = activatedRoute;
    this._dialogService = dialogService;
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
      const ctx = this.canvas.get(i)!.nativeElement.getContext('2d')!;
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

  public scroll(event: WheelEvent) {
    if (event.shiftKey) {
      this.zoomValue += Math.sign(event.deltaY) * -10;
      if (this.zoomValue > 1000) {
        this.zoomValue = 1000;
      } else if (this.zoomValue < 150) {
        this.zoomValue = 150;
      }
      event.preventDefault();
    }
  }

  private back() {
    this._router.navigate(['lobby', this.lobby.id]);
  }

  private download() {
    this._dialogService.showComponentDialog(DownloadColorComponent).result.then(color => {
      if (!color) {
        return;
      }
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
        saveAs(content, `${this.lobby.name}.zip`);
      });
    });
  }
}
