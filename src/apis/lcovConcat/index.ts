/* eslint-disable no-restricted-syntax */
import { Lcov } from '../../types';
import { LcovConcat } from './concat';
import { LcovParser } from '../../parsers';

export * from './concat';

/**
 * 输出合并之后的文件
 * @param path lcov文件路径
 */
export async function lcovConcat(...path: string[]): Promise<Lcov> {
  const parserPromise: Promise<Lcov>[] = [];
  for (const item of path) {
    parserPromise.push(new LcovParser(item).run());
  }

  const res = await Promise.all(parserPromise);

  return new LcovConcat().concat(...res).getRes();
}
