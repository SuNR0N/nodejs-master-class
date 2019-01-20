export class FileOperationError extends Error {
  constructor(
    public message: string,
    public type: string,
    public id: string,
    public operation: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, FileOperationError.prototype);
  }
}
