import { ValidationDefinition } from './validation-definition';
import { ValidationErrorType } from './validation-error-type';

export const validityTexts: ValidationDefinition[] = [
  {
    type: ValidationErrorType.EQUALITY_MISMATCH,
    translationKey: "The texts don't match"
  },
  {
    type: ValidationErrorType.PATTERN_MISMATCH,
    translationKey: "This text doesn't match the pattern"
  },
  {
    type: ValidationErrorType.REQUIRED,
    translationKey: 'This field is required'
  },
  {
    type: ValidationErrorType.TOO_LONG,
    translationKey: 'This text is too long'
  },
  {
    type: ValidationErrorType.TOO_SHORT,
    translationKey: 'This text is too short'
  },
  {
    type: ValidationErrorType.TYPE_MISMATCH,
    translationKey: 'This text is not of the correct type'
  }
];
