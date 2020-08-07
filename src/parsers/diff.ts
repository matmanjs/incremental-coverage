import child from 'child_process';
import { File } from 'gitdiff-parser';
import { Parser } from './index';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/order
import gitdiffParser = require('gitdiff-parser');

export class DiffParser implements Parser {
  // git hash
  hash: string;

  // git 输出的内容
  stdout: string | Buffer = '';

  // exec 参数
  opt: child.ExecOptions;

  constructor(hash: string, opt: child.ExecOptions = {}) {
    this.hash = hash;

    this.opt = opt;
  }

  async run(): Promise<File[]> {
    await this.exec();

    return this.parserDiff();
  }

  /**
   * 执行 git diff 命令
   */
  private async exec() {
    this.stdout = await new Promise((resolve, reject) => {
      child.exec(`git diff ${this.hash}`, this.opt, (err, stdout) => {
        if (err) {
          reject(err);
        }
        resolve(stdout);
      });
    });
  }

  private parserDiff(): File[] {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return gitdiffParser.parse(this.stdout);
  }
}
