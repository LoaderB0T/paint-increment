import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { assertUnreachable } from './unreachable';

export function assertBody<T>(
  response: HttpResponse<T> | (HttpErrorResponse & { error: T | null })
): T {
  let body: T | null;
  if (response instanceof HttpResponse) {
    body = response.body;
  } else if (response instanceof HttpErrorResponse) {
    body = response.error;
  } else {
    assertUnreachable(response);
  }
  if (!body) {
    throw new Error('Response body is empty.');
  }
  return body;
}

export function handleErrorCodes<
  R extends Omit<HttpErrorResponse, 'error'> & { error: T },
  T,
  const C extends R['status'][] = number[],
>(
  response: R,
  handler: (
    error: R extends { status: C[number] }
      ? unknown extends R['error']
        ? null
        : R['error']
      : never
  ) => void,
  codes?: C
): void {
  if (!codes || codes.includes(response.status)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler(response.error as any);
  }
}

export function assertUnhandledStatus(status: never): never {
  throw new Error(`Unhandled status: ${status}`);
}
