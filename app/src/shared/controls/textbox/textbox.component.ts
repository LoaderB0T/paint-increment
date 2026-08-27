import {
  Component,
  input,
  OnInit,
  computed,
  signal,
  ElementRef,
  viewChild,
  afterNextRender,
  afterRenderEffect,
  DestroyRef,
  inject,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormsModule,
  NgControl,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { reTriggerAnimation } from '@shared/utils';
import { TextareaSelectionBounds } from 'textarea-selection-bounds';

import { TooltipDirective } from '../tooltip';

export type InputType = 'text' | 'password' | 'number' | 'email';

@Component({
  imports: [FormsModule, TooltipDirective],
  selector: 'awd-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent implements ControlValueAccessor, OnInit {
  private readonly _control = inject(NgControl, { self: true });
  private readonly _destroyRef = inject(DestroyRef);
  public readonly fontSize = input<number>(16);
  public readonly formControlName = input<string>('');
  public readonly name = input<string>('');
  protected readonly id = computed(() => this.name() || this.formControlName());
  public readonly placeholder = input<string>('');
  public readonly inputType = input<InputType>('text');
  protected readonly inputTypeInternal = computed(() =>
    this.inputType() === 'number' ? 'text' : this.inputType()
  );
  protected readonly caret = signal<{ top: number; left: number; height: number } | null>(null);
  public readonly hidePlaceholderOnInput = input<boolean>(false);
  private readonly _validationStatus = signal<ValidationErrors | null>(null);
  private readonly _inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputField');
  private readonly _caretElement = viewChild<ElementRef<HTMLDivElement>>('caret');

  protected readonly errorCount = computed(
    () => Object.keys(this._validationStatus() ?? {}).length
  );
  protected readonly firstValidationError = computed(() => {
    const errors = this._validationStatus();
    if (!errors) {
      return null;
    }
    const keys = Object.keys(errors);
    return keys[0] ?? null;
  });

  constructor() {
    this._control.valueAccessor = this;
    const numberValidator = Validators.pattern('^[0-9]*$');
    effect(() => {
      if (this.inputType() === 'number') {
        this._control.control?.addValidators(numberValidator);
      } else {
        this._control.control?.removeValidators(numberValidator);
      }
    });

    afterNextRender(() => {
      const control = this._control.control;
      if (!control) {
        return;
      }
      this.refreshErrors();
      // `events` covers both status and touched changes
      control.events.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
        this.refreshErrors();
      });
    });

    afterRenderEffect(onCleanup => {
      const el = this._inputElement().nativeElement;

      const selectionBounds = new TextareaSelectionBounds(el);

      // ponytail: 50ms poll, swap for `selectionchange` if it ever shows up in a profile
      const interval = setInterval(() => {
        const doc = this._inputElement().nativeElement.ownerDocument;
        if (doc.activeElement !== el) {
          this.caret.set(null);
          return;
        }
        const selection = selectionBounds.getCurrentSelection();
        const bounds = selectionBounds.getBounds();
        if (selection.from !== selection.to) {
          this.caret.set(null);
        } else if (!this.caret() || bounds.changed) {
          this.caret.set({
            top: bounds.top + 2,
            left: bounds.left - 2,
            height: bounds.height - 10,
          });
          const el = this._caretElement()?.nativeElement;
          if (!el) {
            return;
          }
          reTriggerAnimation(el);
        }
      }, 50);
      onCleanup(() => clearInterval(interval));
    });
  }

  protected readonly isDisabled = signal<boolean>(false);
  protected readonly value = signal<string | number>('');
  private _onChange?: (value: string | number) => void;
  private _onTouched?: () => void;

  public ngOnInit(): void {
    if (!this.id()) {
      throw new Error('Either name or formControlName must be provided');
    }
  }

  private refreshErrors() {
    const validatorFn = this._control.control?.validator;
    if (!validatorFn || !this._control.touched) {
      this._validationStatus.set(null);
      return;
    }
    const errors = validatorFn(this._control.control);
    this._validationStatus.set(errors);
  }

  public writeValue(obj: string | number): void {
    this.value.set(obj);
  }
  public registerOnChange(fn: (value: string | number) => void): void {
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
    const val = this.inputType() === 'number' ? parseInt(`${this.value()}`) : this.value();
    this._onChange?.(val);
  }
}
