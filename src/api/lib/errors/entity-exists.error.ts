export class EntityExistsError extends Error {
  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityExistsError.prototype);
  }
}
