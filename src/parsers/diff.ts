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
      const command = `git diff ${this.hash}`;

      // 注意不能用 exec, 原因详见 https://github.com/matmanjs/incremental-coverage/issues/8
      const cmd = child.spawn(command, [], {
        ...(this.opt || {}),
        // windows 中如果不设置它的话会出错
        shell: true,
      },);

      let result = '';
      let errMsg = '';

      // 增加一个超时限制
      const checkT = setTimeout(() => {
        resolve(result);
      }, 5000);

      cmd.stdout.on('data', (data) => {
        result += data;
      });

      cmd.stderr.on('data', (data) => {
        // console.error(`stderr: ${data}`);
        errMsg += data;
      });

      cmd.on('close', (code) => {
        clearTimeout(checkT);

        if (code) {
          // console.error(`${command} close: ${code}`);
          reject(new Error(`(close=${code})${errMsg}`));
        } else {
          resolve(result);
        }
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
