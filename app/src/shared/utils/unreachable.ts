// This function is used to ensure that all possible values of a type are handled
export function assertUnreachable<T extends never>(x?: T | null): never {
  throw new Error(`Unexpected value ${x}`);
}

// This function is used to ensure that all possible values of a type are handled
export function assertNever<T extends never>(_?: T | null): void {
  // do nothing
}
