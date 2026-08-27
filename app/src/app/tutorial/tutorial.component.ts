import { Component, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '@shared/controls';
import { TooltipDirective } from '@shared/controls/tooltip';
import { injectI18n } from '@shared/i18n';
import { observeWidth } from '@shared/utils';

import { EXAMPLE_SIZE, exampleLayers } from '../example/example-project';
import { CanvasComponent, CanvasSettings } from '../lobby/canvas/canvas.component';

@Component({
  selector: 'awd-tutorial',
  imports: [ButtonComponent, CanvasComponent, TooltipDirective],
  templateUrl: 'tutorial.component.html',
  styleUrls: ['tutorial.component.scss'],
})
export class TutorialComponent {
  private readonly _router = inject(Router);
  protected readonly i18n = injectI18n();

  protected readonly settings: Required<CanvasSettings> = {
    width: EXAMPLE_SIZE,
    height: EXAMPLE_SIZE,
    canvasPattern: false,
    maxPixels: 0,
  };

  /** One example canvas per section, so each rule is shown on the same growing picture. */
  protected readonly sections = [
    {
      title: this.i18n.tutorial_s1Title,
      text: this.i18n.tutorial_s1Text,
      layers: exampleLayers(1),
    },
    {
      title: this.i18n.tutorial_s2Title,
      text: this.i18n.tutorial_s2Text,
      layers: exampleLayers(4),
    },
    {
      title: this.i18n.tutorial_s3Title,
      text: this.i18n.tutorial_s3Text,
      layers: exampleLayers(7),
    },
    {
      title: this.i18n.tutorial_s4Title,
      text: this.i18n.tutorial_s4Text,
      layers: exampleLayers(10),
    },
    {
      title: this.i18n.tutorial_s5Title,
      text: this.i18n.tutorial_s5Text,
      layers: exampleLayers(13),
    },
    {
      title: this.i18n.tutorial_s6Title,
      text: this.i18n.tutorial_s6Text,
      layers: exampleLayers(16, false),
    },
  ];

  private readonly _figureBoxes = viewChildren<ElementRef<HTMLElement>>('figureBox');
  private readonly _figureSize = signal(0);
  protected readonly figureSize = this._figureSize.asReadonly();

  constructor() {
    observeWidth(this._figureBoxes, this._figureSize);
  }

  protected navigateHome(): void {
    this._router.navigate(['/']);
  }
  protected navigateToExample(): void {
    this._router.navigate(['example']);
  }
  protected navigateToNewLobby(): void {
    this._router.navigate(['lobby', 'new']);
  }
}
