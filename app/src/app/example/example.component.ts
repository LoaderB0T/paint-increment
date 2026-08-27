import { Component, computed, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { interpolate } from '@ngneers/signal-translate';
import { ButtonComponent } from '@shared/controls';
import { TooltipDirective } from '@shared/controls/tooltip';
import { injectI18n } from '@shared/i18n';
import { observeWidth } from '@shared/utils';

import {
  EXAMPLE_CONTRIBUTION_COUNT,
  EXAMPLE_SIZE,
  exampleContributions,
  exampleLayers,
  exampleProject,
} from './example-project';
import { CanvasComponent, CanvasSettings } from '../lobby/canvas/canvas.component';

@Component({
  selector: 'awd-example',
  imports: [ButtonComponent, CanvasComponent, TooltipDirective],
  templateUrl: 'example.component.html',
  styleUrls: ['example.component.scss'],
})
export class ExampleComponent {
  private readonly _router = inject(Router);
  protected readonly i18n = injectI18n();

  protected readonly project = exampleProject;
  protected readonly settings: Required<CanvasSettings> = {
    width: EXAMPLE_SIZE,
    height: EXAMPLE_SIZE,
    canvasPattern: false,
    maxPixels: 0,
  };

  /** The whole picture, no contribution singled out. */
  protected readonly finishedLayers = exampleLayers(EXAMPLE_CONTRIBUTION_COUNT, false);

  protected readonly contributions = exampleContributions.map((contribution, index) => ({
    ...contribution,
    step: index + 1,
    layers: exampleLayers(index + 1),
  }));

  protected readonly subtitle = computed(() =>
    interpolate(this.i18n.example_subtitle(), {
      name: this.project.name,
      count: EXAMPLE_CONTRIBUTION_COUNT,
      pixels: exampleContributions.reduce((sum, c) => sum + c.pixelCount, 0),
    })
  );

  private readonly _thumbBoxes = viewChildren<ElementRef<HTMLElement>>('thumbBox');
  private readonly _thumbSize = signal(0);
  protected readonly thumbSize = this._thumbSize.asReadonly();

  private readonly _bigBoxes = viewChildren<ElementRef<HTMLElement>>('bigBox');
  private readonly _bigSize = signal(0);
  protected readonly bigSize = this._bigSize.asReadonly();

  constructor() {
    observeWidth(this._thumbBoxes, this._thumbSize);
    observeWidth(this._bigBoxes, this._bigSize);
  }

  protected navigateHome(): void {
    this._router.navigate(['/']);
  }
  protected navigateToNewLobby(): void {
    this._router.navigate(['lobby', 'new']);
  }
}
