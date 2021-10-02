import { Component, Input, ViewChild, ElementRef, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { InputType } from '../models/input-type';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { noop } from 'rxjs';
import { ValidationDefinition } from '../models/validation-definition';
import { ValidationErrorType } from '../models/validation-error-type';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'awd-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: TextboxComponent, multi: true },
    { provide: NG_VALIDATORS, useExisting: TextboxComponent, multi: true }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextboxComponent implements ControlValueAccessor, Validator {
  @Input() public validationDefinitions: ValidationDefinition[] = new Array<ValidationDefinition>();
  @Input() public fontSize: number = 16;
  @Input() public name: string = '';
  @Input() public placeholder: string = '';
  @Input() public pattern: string = '';
  @Input() public minLength: number = 0;
  @Input() public maxLength: number = 524288;
  @Input() public inputTabIndex: number = 99999;
  @Input() public inputType: InputType = 'TEXT';
  @Input() public icon: string = '';
  @Input() public icon2: string = '';
  @Input() public hidePlaceholderOnInput: boolean = false;
  @Input() public minValue: number = -1;
  @Input() public maxValue: number = -1;
  @Input() public disabled!: boolean;
  @Input() public readonly: boolean = false;

  @Output() public valueChanged = new EventEmitter();

  @Input()
  public set shouldMatch(value: string) {
    this.shouldMatchValue = value;
    this.onChangeCallback(this.value);
  }
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  @ViewChild('inputField', { static: true })
  private inputElement?: ElementRef<HTMLInputElement>;

  public isDisabled: boolean = false;
  public isFocused: boolean = false;
  private innerValue: any = '';
  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;
  private shouldMatchValue?: string;
  private _control?: AbstractControl;
  private readonly _sanitizer: DomSanitizer;

  constructor(sanitizer: DomSanitizer) {
    this._sanitizer = sanitizer;
  }

  public inputEvent() {
    this.valueChanged.emit(null);
  }

  public get getInputType(): string {
    switch (this.inputType) {
      case 'TEXT':
        return 'text';
      case 'PASSWORD':
        return 'password';
      case 'NUMERIC':
        return 'number';
      case 'EMAIL':
        return 'email';
      default:
        return 'text';
    }
  }

  public get showLabel(): boolean {
    return this.value && `${this.value}`.length > 0;
  }

  public get validationError(): string {
    if (!this._control) {
      return '';
    }
    const myValidity = this.validate(this._control);

    if (!myValidity) {
      return '';
    }

    return myValidity && myValidity.error && myValidity.error.reason;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    let isInvalid = false;
    this._control = control;
    let reason: string | undefined;

    if (this.shouldMatchValue) {
      if (this.value !== this.shouldMatchValue) {
        isInvalid = true;
        const valDef = this.validationDefinitions.find(x => x.type === ValidationErrorType.EQUALITY_MISMATCH);
        reason = valDef?.translationKey;
      }
    }

    if (!this.inputElement?.nativeElement.validity.valid) {
      isInvalid = true;
    }

    if (isInvalid) {
      reason = this.getInvalidityReason()?.translationKey;

      return {
        error: {
          valid: false,
          reason
        }
      };
    } else {
      return null;
    }
  }

  private getInvalidityReason() {
    if (this.inputElement?.nativeElement.validity.valueMissing) {
      return this.validationDefinitions.find(x => x.type === ValidationErrorType.REQUIRED);
    }
    if (this.inputElement?.nativeElement.validity.tooShort) {
      return this.validationDefinitions.find(x => x.type === ValidationErrorType.TOO_SHORT);
    }
    if (this.inputElement?.nativeElement.validity.tooLong) {
      return this.validationDefinitions.find(x => x.type === ValidationErrorType.TOO_LONG);
    }
    if (this.inputElement?.nativeElement.validity.typeMismatch) {
      return this.validationDefinitions.find(x => x.type === ValidationErrorType.TYPE_MISMATCH);
    }
    if (this.inputElement?.nativeElement.validity.patternMismatch) {
      return this.validationDefinitions.find(x => x.type === ValidationErrorType.PATTERN_MISMATCH);
    }
    if (this.shouldMatchValue && this.shouldMatchValue !== this.value) {
      return this.validationDefinitions.find(x => x.type === ValidationErrorType.EQUALITY_MISMATCH);
    }
    return undefined;
  }

  public get cssVariablesStyle() {
    return this._sanitizer.bypassSecurityTrustStyle(`--font-size: ${this.fontSize}px;`);
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  onBlur() {
    this.isFocused = false;
    this.onTouchedCallback();
  }

  onFocus() {
    this.isFocused = true;
  }

  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
