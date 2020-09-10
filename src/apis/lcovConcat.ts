import dayjs from 'dayjs';
import { Lcov } from '../types';
import { IncreaseConcat, LcovConcat } from '../concat';
import { LogParser } from '../parsers';
import { getLcovFile } from '../utils/readLcov';
import { getActualGitRepoRoot } from '../utils';

interface IncreaseLcovConcatOpts {
  cwd?: string;
  hash?: string;
  since?: string;
}

/**
 * 输出合并之后的文件
 * @param lcovPath lcov文件路径
 */
export async function lcovConcat(lcovPath: string | string[]): Promise<Lcov> {
  const res = await getLcovFile(lcovPath);

  return new LcovConcat().concat(...res).getRes();
}

/**
 * 输出合并之后的文件
 * @param opts
 * @param lcovPath lcov文件路径
 */
export async function increaseLcovConcat(
  lcovPath: string | string[],
  opts: IncreaseLcovConcatOpts,
): Promise<Lcov> {
  const res = await getLcovFile(lcovPath);

  // 自动算出当前仓库的根目录
  const cwd = getActualGitRepoRoot(opts.cwd);

  // 传递了日期使用日期
  let { hash } = opts;

  // 得到增量的 hash 进行兜底
  if (!hash) {
    const subDate = dayjs(opts.since ? opts.since : new Date())
      .subtract(1, 'day')
      .format('YYYY-MM-DD');

    const logRes = await new LogParser({
      repo: cwd,
      until: subDate,
    }).run();

    const [firstGitMessage] = logRes;
    hash = firstGitMessage.hash;
  }

  return (
    await new IncreaseConcat({
      cwd,
      hash,
    }).concat(...res)
  ).getRes();
}
