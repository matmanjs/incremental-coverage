import { BaseProcess, BaseProcessOpts, Mapper } from './index';
import { IncreaseResult } from '../../types';

/**
 * 得到增量统计的异步方法
 * @param path lcov 文件的路径
 * @param opts 操作参数
 */
export const getIncrease = async <T extends keyof Mapper>(
  path: string | string[],
  opts?: BaseProcessOpts<T>,
): Promise<IncreaseResult> => {
  const res = await new BaseProcess(path, opts).exec();

  return res;
};
