/* eslint-disable no-restricted-syntax */
import path from 'path';
import { LcovParser } from '../parsers';
import { Lcov } from '../types';

export async function getLcovFile(lcovPath: string[]): Promise<Lcov[]> {
  // 去掉重复文件
  const lcovSet = new Set<string>();
  for (const item of lcovPath) {
    lcovSet.add(path.resolve(item));
  }

  // 并行格式化
  const parserPromise: Promise<Lcov>[] = [];
  for (const item of lcovSet) {
    parserPromise.push(new LcovParser(item).run());
  }

  return Promise.all(parserPromise);
}
