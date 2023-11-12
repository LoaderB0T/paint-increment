import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  EventEmitter,
  OnDestroy,
  Input,
  Output,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

export enum CheckedState {
  UNDEFINED = 0,
  CHECKED = 1,
  UNCHECKED = 2,
}

@Component({
  selector: 'awd-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CheckboxComponent, multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements OnInit, ControlValueAccessor, OnDestroy {
  protected readonly labelTextSig = signal('');
  protected readonly identifierSig = signal('');
  protected readonly iconNameSig = signal('check');
  protected readonly colorSig = signal('');
  protected readonly inputTabIndexSig = signal(99999);
  protected readonly readonlySig = signal(false);
  protected readonly forcedCheckedSig = signal(false);
  protected readonly allowUndefinedStateSig = signal(false);
  protected readonly isDisabledSig = signal(false);
  protected readonly isCheckedSig = computed(() => this._checked() === CheckedState.CHECKED);

  @Input() public set labelText(value: string) {
    this.labelTextSig.set(value);
  }
  @Input({ required: true }) public set identifier(value: string) {
    this.identifierSig.set(value);
  }
  @Input() public set iconName(value: string) {
    this.iconNameSig.set(value);
  }
  @Input() public set color(value: string) {
    this.colorSig.set(value);
  }
  @Input() public set inputTabIndex(value: number) {
    this.inputTabIndexSig.set(value);
  }
  @Input() set readonly(value: boolean) {
    this.readonlySig.set(value);
  }
  @Input() public set forcedChecked(value: boolean) {
    this.forcedCheckedSig.set(value);
  }
  @Input() public set allowUndefinedState(value: boolean) {
    this.allowUndefinedStateSig.set(value);
  }
  @Output() private readonly stateChanged = new EventEmitter<boolean>();

  private readonly _checked = signal<CheckedState>(CheckedState.UNCHECKED);
  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  public ngOnInit() {
    if (this.forcedChecked) {
      this._checked.set(CheckedState.CHECKED);
    }
  }

  protected setIsChecked(value: boolean) {
    if (value === null || value === undefined) {
      this._checked.set(this.allowUndefinedState ? CheckedState.UNDEFINED : CheckedState.UNCHECKED);
    } else {
      this._checked.set(value ? CheckedState.CHECKED : CheckedState.UNCHECKED);
    }
    this.onChangeCallback(value);
    this.stateChanged.next(this.isCheckedSig());
  }

  protected onBlur() {
    this.onTouchedCallback();
  }

  public writeValue(value: any): void {
    if (value === null || value === undefined) {
      this._checked.set(this.allowUndefinedState ? CheckedState.UNDEFINED : CheckedState.UNCHECKED);
    } else if (value !== this._checked) {
      this._checked.set(value ? CheckedState.CHECKED : CheckedState.UNCHECKED);
    }
  }
  public registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }
  public registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabledSig.set(isDisabled);
  }

  public ngOnDestroy(): void {
    this.stateChanged.complete();
  }
}
