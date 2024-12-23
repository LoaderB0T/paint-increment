import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';

export function extractTouched(control: AbstractControl): Observable<boolean> {
  return new Observable<boolean>(observer => {
    const originalMarkAsTouched = control.markAsTouched;
    const originalReset = control.reset;

    control.reset = (...args) => {
      setTimeout(() => {
        observer.next(false);
      });
      originalReset.call(control, ...args);
    };

    control.markAsTouched = (...args) => {
      setTimeout(() => {
        observer.next(true);
      });
      originalMarkAsTouched.call(control, ...args);
    };

    observer.next(control.touched);

    return () => {
      control.markAsTouched = originalMarkAsTouched;
      control.reset = originalReset;
    };
  });
}
