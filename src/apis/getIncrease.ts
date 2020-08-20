import { IncreaseProcess, IncreaseProcessOpts, Mapper } from './process';
import { IncreaseResult } from '../types';

/**
 * 得到增量统计的异步方法
 * @param path lcov 文件的路径
 * @param opts 操作参数
 */
export const getIncrease = async <T extends keyof Mapper>(
  path: string | string[],
  opts?: IncreaseProcessOpts<T>,
): Promise<IncreaseResult> => {
  const res = await new IncreaseProcess(path, opts).exec();

  return res;
};
