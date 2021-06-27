import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LobbyResponse } from '../.api/models/lobby-response';

@Component({
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements AfterViewInit {
  private readonly _activatedRoute: ActivatedRoute;
  public lobby: LobbyResponse;
  private _dragging: boolean = false;

  @ViewChild('canvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true })
  canvasContainer?: ElementRef<HTMLDivElement>;
  private _ctx?: CanvasRenderingContext2D;
  public zoom: number = 1;
  public offsetX: number = 0;
  public offsetY: number = 0;

  constructor(activatedRoute: ActivatedRoute) {
    this._activatedRoute = activatedRoute;
    this.lobby = this._activatedRoute.snapshot.data.lobby;
    console.log(this.lobby);
  }

  public ngAfterViewInit(): void {
    if (!this.canvas || !this.canvasContainer) {
      throw new Error('Canvas or canvasContainer not initialized yet');
    }
    this._ctx = this.canvas.nativeElement.getContext('2d')!;
    this._ctx.fillStyle = 'white';
    this._ctx.fillRect(0, 0, this.width, this.height);
    for (let x = 0; x < this.lobby.pixelMap.length; x++) {
      const row = this.lobby.pixelMap[x];
      for (let y = 0; y < row.length; y++) {
        const p = row[y];
        if ((x + y) % 2 === 0) {
          this._ctx.fillStyle = '#a5a5a5';
          this._ctx?.fillRect(x, y, 1, 1);
        }
        if (p) {
          this._ctx.fillStyle = 'black';
          this._ctx?.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  public get width(): number {
    return this.lobby.pixelMap.length;
  }
  public get height(): number {
    return this.lobby.pixelMap[0].length;
  }

  public gotWheel(event: WheelEvent) {
    if (event.deltaY > 0) {
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
    this._ctx?.scale(this.zoom, this.zoom);
    event.preventDefault();
  }

  public mouseDown(event: MouseEvent) {
    this._dragging = event.button === 1;
  }
  public mouseUp() {
    this._dragging = false;
  }
  public mouseLeave() {
    this._dragging = false;
  }

  public mouseMove(event: MouseEvent) {
    if (this._dragging) {
      this.offsetX += event.movementX / this.zoom;
      this.offsetY += event.movementY / this.zoom;
      this.fixOffsets();
    }
  }

  private fixOffsets() {
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
