import { Component, OnInit, ChangeDetectorRef, EventEmitter, OnDestroy, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

export enum CheckedState {
  UNDEFINED = 0,
  CHECKED = 1,
  UNCHECKED = 2
}

@Component({
  selector: 'awd-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CheckboxComponent, multi: true }]
})
export class CheckboxComponent implements OnInit, ControlValueAccessor, OnDestroy {
  @Input() public labelText: string = '';
  @Input() public identifier: string = '';
  @Input() public iconName: string = 'check';
  @Input() public color: string = '';
  @Input() public inputTabIndex: number = 99999;
  @Input() set isReadonly(value: boolean) {
    this.readonly = value;
    if (this.ref) {
      this.ref.detectChanges();
    }
  }
  @Input() public forcedChecked: boolean = false;
  @Input() public allowUndefinedState: boolean = false;
  @Output() private readonly stateChanged = new EventEmitter<boolean>();
  public isDisabled: boolean = false;
  private checked: CheckedState = CheckedState.UNCHECKED;
  public readonly: boolean = false;
  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;
  private ref: ChangeDetectorRef | null;

  constructor(ref: ChangeDetectorRef) {
    this.ref = ref;
    this.ref.detach();
  }

  ngOnInit() {
    if (this.forcedChecked) {
      this.checked = CheckedState.CHECKED;
    }
    if (this.checked === undefined) {
      this.checked = CheckedState.UNCHECKED;
    }
    this.ref?.detectChanges();
  }

  public get getLabelText(): string {
    return this.labelText || '\u00A0';
  }

  public get isChecked(): boolean {
    return this.checked === CheckedState.CHECKED;
  }

  public set isChecked(value: boolean) {
    if (value === null || value === undefined) {
      this.checked = this.allowUndefinedState ? CheckedState.UNDEFINED : CheckedState.UNCHECKED;
    } else {
      this.checked = value ? CheckedState.CHECKED : CheckedState.UNCHECKED;
    }
    this.onChangeCallback(value);
    this.stateChanged.next(this.isChecked);
    this.ref?.detectChanges();
  }

  public clicked(event: Event) {
    if (event) {
      event.preventDefault();
    }
    if (this.readonly) {
      return;
    }
    if (this.isChecked) {
      this.isChecked = false;
    } else if (!this.isChecked) {
      this.isChecked = true;
    }
  }

  public get checkedBoolValue(): boolean {
    return this.isChecked;
  }
  public set checkedBoolValue(value: boolean) {
    this.isChecked = value;
  }
  public get isUndefinedState(): boolean {
    return this.checked === CheckedState.UNDEFINED;
  }

  onBlur() {
    this.onTouchedCallback();
    if (this.ref) {
      this.ref.detectChanges();
    }
  }

  writeValue(value: any): void {
    if (value === null || value === undefined) {
      this.checked = this.allowUndefinedState ? CheckedState.UNDEFINED : CheckedState.UNCHECKED;
    } else if (value !== this.checked) {
      this.checked = value ? CheckedState.CHECKED : CheckedState.UNCHECKED;
    }
    if (this.ref) {
      this.ref.detectChanges();
    }
  }
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (this.ref) {
      this.ref.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.ref = null;
    this.stateChanged.complete();
  }
}
