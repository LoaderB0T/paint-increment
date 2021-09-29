import { ValidationErrorType } from './validation-error-type';

export interface ValidationDefinition {
  type: ValidationErrorType;
  translationKey: string;
}
