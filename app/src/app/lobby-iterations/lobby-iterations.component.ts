import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IterationModel } from '../.api/models/iteration-model';
import { LobbyResponse } from '../.api/models/lobby-response';
import { EditIterationComponent } from '../dialogs/edit-iteration/edit-iteration.component';
import { ActionItem } from '../models/action-item.model';
import { DialogService } from '../services/dialog.service';

@Component({
  templateUrl: './lobby-iterations.component.html',
  styleUrls: ['./lobby-iterations.component.scss']
})
export class LobbyIterationsComponent implements AfterViewInit {
  private readonly _activatedRoute: ActivatedRoute;
  private readonly _router: Router;
  private readonly _dialogService: DialogService;
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

  constructor(activatedRoute: ActivatedRoute, router: Router, dialogService: DialogService) {
    this._activatedRoute = activatedRoute;
    this._router = router;
    this._dialogService = dialogService;

    this.lobby = this._activatedRoute.snapshot.data.lobby as LobbyResponse;
  }

  public get width(): number {
    return this.lobby.settings.width;
  }

  public get height(): number {
    return this.lobby.settings.height;
  }

  public ngAfterViewInit(): void {
    for (let i = 0; i < this.lobby.pixelIterations.length; i++) {
      const ctx = this.canvas.get(i)!.nativeElement.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, this.lobby.settings.width, this.lobby.settings.height);
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
    this._router.navigate(['lobby', this.lobby.id, 'download']);
  }

  public editIteration(iteration: IterationModel) {
    const index = this.lobby.pixelIterations.indexOf(iteration);
    if (index === -1) {
      throw new Error(`Iteration of ${iteration.name} not found`);
    }
    this._dialogService
      .showComponentDialog<EditIterationComponent>(EditIterationComponent, c => {
        c.lobby = this.lobby;
        c.iterationIndex = index;
      })
      .result.then(newIteration => {
        if (newIteration) {
          // TODO: update iteration
        }
      });
  }
}
