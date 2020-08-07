import fs from 'fs-extra';
import path from 'path';
import { gitlogPromise, GitlogOptions } from 'gitlog';
import { Parser } from './index';

export class LogParser implements Parser {
  // gitlogPromise 参数
  private opt: GitlogOptions;

  constructor(
    opt: GitlogOptions = {
      repo: process.cwd(),
    },
  ) {
    this.opt = opt;
  }

  async run() {
    const res = await this.exec();
    return res;
  }

  /**
   * 执行 git log 得到对应的记录
   */
  private async exec() {
    // 判断是否为 git 仓库文件夹
    const rootPath = path.resolve(this.opt.repo || process.cwd(), '.git');
    if (!fs.existsSync(rootPath)) {
      throw new Error('请选择 git 仓库运行');
    }

    // 执行 log
    const log = await gitlogPromise(this.opt);

    return log;
  }
}
