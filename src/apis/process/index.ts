import { execSync } from 'child_process';
import { FileStream, FileStreamOpt, StdoutStream, StdoutStreamOpt, Stream } from '../../streams';
import { FirstInfo, FormatData, FullResult, Lcov } from '../../types';

/**
 * 两种不同类型的 Stream
 */
export interface Mapper {
  stdio: StdoutStreamOpt;
  file: FileStreamOpt;
}

/**
 * BaseProcess 的配置参数
 */
export interface BaseProcessOpts<T extends keyof Mapper> {
  cwd?: string;
  output?: boolean;
  stream: {
    name?: T;
    opts?: T extends 'stdio' ? StdoutStreamOpt : FileStreamOpt;
  };
}

export abstract class BaseProcess<T extends keyof Mapper> {
  lcovPath: string[] = [];

  opts: BaseProcessOpts<T> = {
    stream: {},
  };

  protected lcov: Lcov = { $: { linesCovered: 0, linesValid: 0 }, detail: {} };

  protected formatData: FormatData = {
    total: { line: 0, covLine: 0, rate: '' },
    files: [],
  };

  protected firstInfo: FirstInfo | undefined;

  abstract async exec(): Promise<FullResult>;

  /**
   * 进行格式化进行结果输出
   */
  protected format() {
    this.formatData.total.covLine = this.lcov.$.linesCovered;
    this.formatData.total.line = this.lcov.$.linesValid;
    this.formatData.total.rate = `${(
      (this.lcov.$.linesCovered / this.lcov.$.linesValid) *
      100
    ).toFixed(2)}%`;

    Object.entries(this.lcov.detail).forEach(([name, detail]) => {
      const temp: {
        name: string;
        line?: number;
        covLine?: number;
        rate?: string;
        detail?: { number: number; hits: number }[];
      } = {
        name,
        line: detail.linesValid,
        covLine: detail.linesCovered,
        rate: `${(detail.lineRate * 100).toFixed(2)}%`,
        detail: [],
      };

      temp.detail = detail.lines.map((item) => {
        return {
          number: +item.number,
          hits: item.hits,
        };
      });

      this.formatData.files.push(temp);
    });
  }

  /**
   * 输出结果到对应的流
   */
  protected output(data: unknown) {
    let tempStream: Stream;

    if (this.opts.stream?.name === 'file') {
      tempStream = new FileStream(data, this.opts.stream.opts);
    } else if (this.opts.stream?.name === 'stdio') {
      tempStream = new StdoutStream(data, this.opts.stream.opts);
    } else {
      throw new Error('参数错误');
    }

    tempStream.outToStream();
  }

  /**
   * 得到仓库第一次提交的信息
   */
  protected createInfo() {
    const res = execSync('git log --reverse --pretty="%H!!!%h!!!%aN!!!%aE!!!%ad!!!%B"', {
      cwd: this.opts.cwd,
    })
      .toString()
      .split('\n');
    const first = res[0].split('!!!');

    this.firstInfo = {
      hash: first[0],
      abbrevHash: first[1],
      authorName: first[2],
      authorEmail: first[3],
      authorDate: first[4],
      subject: first[5],
    };
  }
}

export * from './full';
export * from './increase';
