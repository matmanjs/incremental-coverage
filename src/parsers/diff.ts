import fs from 'fs-extra';
import path from 'path';
import child from 'child_process';
import { File } from 'gitdiff-parser';
import { Parser } from './index';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/order
import gitdiffParser = require('gitdiff-parser');

export class DiffParser implements Parser {
  // git hash
  private hash: string;

  // git 输出的内容
  private stdout: string | Buffer = '';

  // exec 参数
  private opt: child.ExecOptions;

  constructor(hash: string, opt: child.ExecOptions = {}) {
    this.hash = hash;
    if (typeof hash !== 'string') {
      this.hash = '';
    }

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
    // 判断是否为 git 仓库文件夹
    const rootPath = path.resolve(this.opt.cwd || process.cwd(), '.git');
    if (!fs.existsSync(rootPath)) {
      throw new Error('请选择 git 仓库运行');
    }

    // 执行 diff
    this.stdout = await new Promise((resolve, reject) => {
      child.exec(`git diff ${this.hash}`, this.opt, (err, stdout) => {
        if (err) {
          reject(err);
        }
        resolve(stdout);
      });
    });
  }

  /**
   * 解析 git diff 数据
   */
  private parserDiff(): File[] {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return gitdiffParser.parse(this.stdout);
  }
}
