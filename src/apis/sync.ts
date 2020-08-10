import { Worker } from 'worker_threads';
import { resolve } from 'path';
import { BaseProcessOpts, Mapper } from './index';

const share = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);

/**
 * 得到增量统计的同步方法
 * @param path lcov 文件的路径
 * @param opts 操作参数
 */
export const getIncreaseSync = <T extends keyof Mapper>(
  path: string,
  opts?: BaseProcessOpts<T>,
): void => {
  // eslint-disable-next-line no-new
  new Worker(resolve(__dirname, 'exec.js'), {
    workerData: {
      path,
      opts,
      share,
    },
  });

  const able = new Int32Array(share);

  // eslint-disable-next-line no-empty
  while (!able[0]) {}
};
