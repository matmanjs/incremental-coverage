import { workerData } from 'worker_threads';
import { BaseProcess } from './index';

(() => {
  const { share, path, opts } = workerData;
  const temp = new Int32Array(share);

  new BaseProcess(path, opts)
    .exec()
    .then(() => {
      temp[0] = 1;
    })
    .catch(() => {
      temp[0] = 1;
    });
})();
