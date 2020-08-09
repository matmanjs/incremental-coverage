import path from 'path';
import fs from 'fs-extra';
import { Stream } from './index';

export interface FileStreamOpt {
  type?: 'json' | 'yaml';
  filePath?: string;
}

export class FileStream extends Stream {
  // 输出的参数
  opts: FileStreamOpt = {};

  constructor(content: unknown, opts?: FileStreamOpt);
  constructor(content: unknown, filePath?: string, opts?: FileStreamOpt);
  constructor(content: unknown, filePath?: string | FileStreamOpt, opts?: FileStreamOpt) {
    super(content);

    // 第二个参数为 string
    if (typeof filePath === 'string') {
      this.opts.filePath = filePath;

      // 处理第三个参数
      this.opts.type = opts?.type || 'json';

      return;
    }

    // 第二个参数是对象
    if (filePath instanceof Object) {
      this.opts.filePath = filePath.filePath || process.cwd();
      this.opts.type = filePath.type || 'json';

      return;
    }

    // 只有一个参数
    this.opts.filePath = process.cwd();
    this.opts.type = 'json';
  }

  /**
   * 输出文件到文件流中
   * @param content
   * @param opts
   */
  outToStream(): void {
    // 得到字符串
    let res = '';
    if (this.opts.type === 'yaml') {
      res = super.dumpYaml();
    } else {
      res = this.dumpJSON();
    }

    // 写入文件
    fs.writeFileSync(
      path.resolve(
        this.opts.filePath as string,
        `output.${this.opts.type === 'yaml' ? 'yml' : 'json'}`,
      ),
      res,
    );
  }
}
