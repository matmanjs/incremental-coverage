/* eslint-disable no-restricted-syntax */
import path from 'path';
import { Lcov } from '../../types';
import { LcovConcat } from './concat';
import { LcovParser } from '../../parsers';

export * from './concat';

/**
 * 输出合并之后的文件
 * @param path lcov文件路径
 */
export async function lcovConcat(...lcovPath: string[]): Promise<Lcov> {
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

  const res = await Promise.all(parserPromise);

  return new LcovConcat().concat(...res).getRes();
}
