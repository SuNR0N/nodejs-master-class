import { ICheck } from './check';
import { ICheckOutcome } from './check-outcome';

export interface ILogData {
  check: ICheck;
  outcome: Pick<ICheckOutcome, 'error' | 'responseCode'>;
  state: string;
  alert: boolean;
  time: number;
}
