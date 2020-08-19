import { Lcov } from '../types';

export interface Concat {
  concat(...args: Lcov[]): void;
}

export { LcovConcat } from './fullConcat';
export { IncreaseConcat } from './increaseConcat';
