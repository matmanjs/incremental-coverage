import 'mocha';
import { expect } from 'chai';

import * as incrementalCoverage from '../../src/index';

describe('./index.ts', () => {
  it('export should be correct', () => {
    expect(incrementalCoverage).to.have.all.keys(
      "DiffParser",
      "LcovConcat",
      "LcovParser",
      "LogParser",
      "getIncrease",
      "increaseLcovConcat",
      "lcovConcat",
    );
  });
});
