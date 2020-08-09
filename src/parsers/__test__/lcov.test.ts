import { LcovParser } from '../lcov';

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
  });
});
