export interface IUser {
  checks?: string[];
  firstName: string;
  hashedPassword: string;
  lastName: string;
  phone: string;
  tosAgreement: boolean;
}
