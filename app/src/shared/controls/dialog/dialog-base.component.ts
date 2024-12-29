export abstract class DialogBase<T = void> {
  public readonly dialogId = Math.random().toString(36).slice(2);
  private readonly _resolver = Promise.withResolvers<T | void>();
  public readonly result = this._resolver.promise;

  public close(result: T | void) {
    this._resolver.resolve(result);
  }
}
