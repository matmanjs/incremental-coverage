/* eslint-disable no-restricted-syntax */
import path from 'path';
import dayjs from 'dayjs';
import { Lcov } from '../types';
import { LcovConcat, IncreaseConcat } from '../concat';
import { LcovParser, LogParser } from '../parsers';

interface IncreaseLcovConcatOpts {
  cwd?: string;
  hash?: string;
  since?: string;
}

async function getLcovFile(lcovPath: string[]) {
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

/**
 * 输出合并之后的文件
 * @param lcovPath lcov文件路径
 */
export async function lcovConcat(lcovPath: string[]): Promise<Lcov> {
  const res = await getLcovFile(lcovPath);

  return new LcovConcat().concat(...res).getRes();
}

/**
 * 输出合并之后的文件
 * @param opts
 * @param lcovPath lcov文件路径
 */
export async function increaseLcovConcat(
  lcovPath: string[],
  opts: IncreaseLcovConcatOpts,
): Promise<Lcov> {
  const res = await getLcovFile(lcovPath);

  // 传递了日期使用日期
  let { hash } = opts;

  // 得到增量的 hash 进行兜底
  if (!hash) {
    const subDate = dayjs(opts.since ? opts.since : new Date())
      .subtract(1, 'day')
      .format('YYYY-MM-DD');

    const logRes = await new LogParser({
      repo: opts.cwd as string,
      until: subDate,
    }).run();

    const [firstGitMessage] = logRes;
    hash = firstGitMessage.hash;
  }

  return (
    await new IncreaseConcat({
      cwd: opts.cwd,
      hash,
    }).concat(...res)
  ).getRes();
}
