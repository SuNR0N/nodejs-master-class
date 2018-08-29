export class EntityNotFoundError extends Error {
  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }
}
