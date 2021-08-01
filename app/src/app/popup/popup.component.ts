import { ChangeDetectorRef, Component, Inject, ViewRef } from '@angular/core';
import { PopupService } from '../services/popup.service';

@Component({
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {
  public index: number = -1;
  private _text: string = 'Loading ...';
  private readonly _popupService: PopupService;
  private readonly _viewRef: ViewRef;

  constructor(popupService: PopupService, @Inject(ChangeDetectorRef) viewRef: ViewRef) {
    this._popupService = popupService;
    this._viewRef = viewRef;
  }

  setText(text: string) {
    this._text = text;
  }

  hide() {
    this._popupService.hide(this.index);
  }

  public get text(): string {
    return this._text;
  }
}
