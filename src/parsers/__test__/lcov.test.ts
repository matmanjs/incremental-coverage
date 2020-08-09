import { LcovParser } from '../lcov';
import { Info } from '../../types';

describe('Test LcovParser', () => {
  describe('Test constructor function', () => {
    test('No params', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-new
        new LcovParser(null);
      }).toThrow();

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-new
        new LcovParser();
      }).toThrow();
    });

    test('Not string', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-new
        new LcovParser({});
      }).toThrow();

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-new
        new LcovParser([]);
      }).toThrow();

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-new
        new LcovParser(1);
      }).toThrow();
    });

    test('Not a file', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-new
        new LcovParser('123.txt');
      }).toThrow();

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-new
        new LcovParser('./data');
      }).toThrow();
    });
  });

  describe('Test run function', () => {
    let res: Info = {};

    beforeAll(async () => {
      res = await new LcovParser('./data/lcov.info').run();
    });

    test('Check res type', () => {
      expect(res).toBeDefined();
      expect(typeof res).toBe('object');
    });

    test('Result contain $', () => {
      expect(res.$).toBeDefined();
      expect(res.$).toMatchObject({
        linesValid: expect.any(Number),
        linesCovered: expect.any(Number),
      });
    });

    test('Result contain File', () => {
      expect(
        res[
          '/Users/wangjinquan/Documents/Project/now-h5-personal-center/src/pages/verify-identity/business/window-gConfig/index.js'
        ],
      ).toBeDefined();
    });
  });
});
