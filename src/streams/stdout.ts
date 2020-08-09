import { Console } from 'console';
import { Stream } from './index';

type IOType = 'stdout' | 'stderr';

interface StdoutStreamOpt {
  ioType?: IOType;
  type?: 'json' | 'yaml';
}

export class StdoutStream extends Stream {
  // 输出的参数
  opts: StdoutStreamOpt = {};

  constructor(content: unknown, opts?: StdoutStreamOpt);
  constructor(content: unknown, ioType?: IOType, opts?: StdoutStreamOpt);
  constructor(content: unknown, ioType?: IOType | StdoutStreamOpt, opts?: StdoutStreamOpt) {
    super(content);

    // 第二个参数为 string
    if (typeof ioType === 'string') {
      this.opts.ioType = ioType;

      // 处理第三个参数
      this.opts.type = opts?.type || 'json';

      return;
    }

    // 第二个参数是对象
    if (ioType instanceof Object) {
      this.opts.ioType = ioType.ioType || 'stdout';
      this.opts.type = ioType.type || 'json';

      return;
    }

    // 只有一个参数
    this.opts.ioType = 'stdout';
    this.opts.type = 'json';
  }

  /**
   * 输出文件到输入输出流中
   * @param content
   * @param opts
   */
  outToStream(): void {
    // 得到字符串
    let res = '';
    if (this.opts.type === 'yaml') {
      res = super.dumpYaml();
    } else {
      res = this.dumpJSON(2);
    }

    // 写入输入输出流
    const selfConsole = new Console(process.stdout, process.stderr);
    if (this.opts.ioType === 'stderr') {
      selfConsole.error(res);
    } else {
      selfConsole.log(res);
    }
  }
}
