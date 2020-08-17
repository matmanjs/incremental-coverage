import { Lcov } from '../../types';
import { LcovConcat } from './concat';

export * from './concat';

export function lcovConcat(...lcov: Lcov[]): Lcov {
  return new LcovConcat().concat(...lcov).getRes();
}
