import { BaseProcess, BaseProcessOpts, Mapper, IncresseResult } from './index';

/**
 * 得到增量统计的异步方法
 * @param path lcov 文件的路径
 * @param opts 操作参数
 */
export const getIncrease = async <T extends keyof Mapper>(
  path: string,
  opts?: BaseProcessOpts<T>,
): Promise<IncresseResult> => {
  const res = await new BaseProcess(path, opts).exec();

  return res;
};
