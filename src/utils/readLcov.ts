/* eslint-disable no-restricted-syntax */
import path from 'path';
import { LcovParser } from '../parsers';
import { Lcov } from '../types';

export async function getLcovFile(lcovPath: string | string[]): Promise<Lcov[]> {
  // 去掉重复文件
  const lcovSet = new Set<string>();

  // lcovPath 有可能是单个文件，也可能是多个文件数组
  if (typeof lcovPath === 'string') {
    lcovSet.add(path.resolve(lcovPath));
  } else {
    for (const item of lcovPath) {
      lcovSet.add(path.resolve(item));
    }
  }

  // 并行格式化
  const parserPromise: Promise<Lcov>[] = [];
  for (const item of lcovSet) {
    parserPromise.push(new LcovParser(item).run());
  }

  return Promise.all(parserPromise);
}
