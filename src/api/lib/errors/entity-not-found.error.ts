export class EntityNotFoundError extends Error {
  constructor(
    public message: string,
    public type: string,
    public id: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }
}
