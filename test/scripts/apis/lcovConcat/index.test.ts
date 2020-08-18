import * as path from 'path';
import 'mocha';
import { expect } from 'chai';
import * as fse from 'fs-extra';

import { lcovConcat } from '../../../../src/apis/lcovConcat';
import { Lcov } from '../../../../src';

const TMP_PATH = path.join(__dirname, '../../../tmp');
const BASE_DEMO_1 = path.join(__dirname, '../../../data/fixtures/demo1');
const EXPECT_DEMO_1 = path.join(__dirname, '../../../data/expects/demo1');

describe('./apis/lcovConcat/index.ts', () => {
  describe('lcovConcat(unit_test_lcov)', () => {
    const lcovInfoFilePath = path.join(BASE_DEMO_1, 'unit-test/lcov.info');
    const expectResultFile = path.join(EXPECT_DEMO_1, 'unit-test/full.json');
    const tmpResultFile = path.join(TMP_PATH, `unit_${Date.now()}`, 'result.json');

    let result: Lcov;

    before(async () => {
      result = await lcovConcat(lcovInfoFilePath);
      fse.outputJsonSync(tmpResultFile, result);
    });

    after(async () => {
      fse.removeSync(tmpResultFile);
    });

    it('check line coverage correct 32/104', async () => {
      expect(result.$).to.eql({
        linesCovered: 32,
        linesValid: 104
      });
    });

    it('check result correct', async () => {
      const expectContent = fse.readJsonSync(expectResultFile);
      expect(result).to.eql(expectContent);
    });
  });

  describe('lcovConcat(e2e_test_lcov)', () => {
    const lcovInfoFilePath = path.join(BASE_DEMO_1, 'e2e-test/lcov.info');
    const expectResultFile = path.join(EXPECT_DEMO_1, 'e2e-test/full.json');
    const tmpResultFile = path.join(TMP_PATH, `e2e_${Date.now()}`, 'result.json');

    let result: Lcov;

    before(async () => {
      result = await lcovConcat(lcovInfoFilePath);
      fse.outputJsonSync(tmpResultFile, result);
    });

    after(async () => {
      fse.removeSync(tmpResultFile);
    });

    it('check line coverage correct 121/144', async () => {
      expect(result.$).to.eql({
        linesCovered: 121,
        linesValid: 144
      });
    });

    it('check result correct', async () => {
      const expectContent = fse.readJsonSync(expectResultFile);
      expect(result).to.eql(expectContent);
    });
  });

  describe('lcovConcat(unit_test_lcov, e2e_test_lcov)', () => {
    const unitLcovInfoFilePath = path.join(BASE_DEMO_1, 'unit-test/lcov.info');
    const e2eLcovInfoFilePath = path.join(BASE_DEMO_1, 'e2e-test/lcov.info');
    const expectResultFile = path.join(EXPECT_DEMO_1, 'merged/full.json');
    const tmpResultFile = path.join(TMP_PATH, `merged_${Date.now()}`, 'result.json');

    let result: Lcov;

    before(async () => {
      result = await lcovConcat(unitLcovInfoFilePath, e2eLcovInfoFilePath);
      fse.outputJsonSync(tmpResultFile, result);
    });

    after(async () => {
      fse.removeSync(tmpResultFile);
    });

    it.skip('check line coverage correct 126/145', async () => {
      expect(result.$).to.eql({
        linesCovered: 126,
        linesValid: 145
      });
    });

    it('check result correct', async () => {
      const expectContent = fse.readJsonSync(expectResultFile);
      expect(result).to.eql(expectContent);
    });
  });

});
