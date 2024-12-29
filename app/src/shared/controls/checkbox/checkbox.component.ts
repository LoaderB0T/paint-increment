import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  input,
  OnInit,
  computed,
  signal,
  inject,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';

@Component({
  selector: 'awd-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements ControlValueAccessor, OnInit {
  private readonly _control = inject(NgControl, { self: true });
  public readonly fontSize = input<number>(16);
  public readonly formControlName = input<string>('');
  public readonly name = input<string>('');
  protected readonly id = computed(() => this.name() || this.formControlName());
  public readonly text = input<string>('');

  constructor() {
    this._control.valueAccessor = this;
  }

  protected readonly isDisabled = signal<boolean>(false);
  protected readonly value = signal<boolean>(false);
  private _onChange?: (value: boolean) => void;
  private _onTouched?: () => void;

  public ngOnInit(): void {
    if (!this.id()) {
      throw new Error('Either name or formControlName must be provided');
    }
  }

  public writeValue(value: boolean): void {
    this.value.set(value);
  }
  public registerOnChange(fn: (value: boolean) => void): void {
    this._onChange = fn;
  }
  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  protected onBlur() {
    this._onTouched?.();
  }
  protected onInput() {
    this._onChange?.(this.value());
  }
}
