import { Locv, DetailLines } from '../../types';

export class LcovConcat {
  private res: Locv | null = null;

  concat(lcov: Locv): void {
    if (this.res === null) {
      this.res = lcov;
      return;
    }

    let hits = 0;
    let found = 0;
    const tempRes: Locv = { detail: {} };

    Object.keys(this.res.detail).forEach((resItem) => {
      if (lcov.detail[resItem]) {
        let fileHits = 0;
        let fileFound = 0;
      } else {
        tempRes.detail[resItem] = this.res?.detail[resItem] as DetailLines;
      }
    });

    Object.keys(lcov.detail).forEach((resItem) => {
      if (!tempRes.detail[resItem]) {
        tempRes.detail[resItem] = lcov.detail[resItem];
      }
    });

    this.res = tempRes;
  }
}
