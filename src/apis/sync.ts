import { BaseProcess, BaseProcessOpts, Mapper } from './index';

/**
 * 得到增量统计的同步方法
 * @param path lcov 文件的路径
 * @param opts 操作参数
 */
export const getIncreaseSync = async <T extends keyof Mapper>(
  path: string,
  opts?: BaseProcessOpts<T>,
): Promise<void> => {
  let flag = false;
  let err: Error;

  const timer = setTimeout(() => {
    err = new Error('操作超时');
    flag = true;
  }, 10 * 1000);

  new BaseProcess(path, opts)
    .exec()
    .then(() => {
      clearTimeout(timer);
      flag = true;
    })
    .catch((e) => {
      clearTimeout(timer);
      err = e;
      flag = true;
    });

  // eslint-disable-next-line no-empty
  while (!flag) {}

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (err) {
    throw err;
  }
};
