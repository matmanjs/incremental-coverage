import { FullProcess, BaseProcessOpts, Mapper } from './process';
import { FullResult } from '../types';

/**
 * 得到增量统计的异步方法
 * @param path lcov 文件的路径
 * @param opts 操作参数
 */
export const getFull = async <T extends keyof Mapper>(
  path: string | string[],
  opts?: BaseProcessOpts<T>,
): Promise<FullResult> => {
  const res = await new FullProcess(path, opts).exec();

  return res;
};
