import os from 'os';
import dayjs from 'dayjs';
import { File } from 'gitdiff-parser';
import { LcovParser, LogParser, DiffParser } from '../parsers';
import { FileStreamOpt, StdoutStreamOpt, Stream, FileStream, StdoutStream } from '../streams';
import { Info, DetailLines } from '../types';

export interface Mapper {
  stdio: StdoutStreamOpt;
  file: FileStreamOpt;
}

export interface BaseProcessOpts<T extends keyof Mapper> {
  since?: string;
  cwd?: string;
  stream: {
    name?: T;
    opts?: T extends 'stdio' ? StdoutStreamOpt : FileStreamOpt;
  };
}

interface CommitBase {
  files?: string[];
  abbrevHash?: string;
  hash?: string;
  subject?: string;
  authorName?: string;
  authorDate?: string;
}

export class BaseProcess<T extends keyof Mapper> {
  lcovPath: string;

  opts: BaseProcessOpts<T> = {
    stream: {},
  };

  private lcov: Info = {};

  private firstGitMessage: CommitBase = {};

  private diffData: File[] = [];

  private formatData: {
    total: {
      increLine: number;
      covLine: number;
      increRate: string;
    };
    files: {
      increLine?: number;
      covLine?: number;
      increRate?: string;
      detail?: { number: number; hits: number }[];
    }[];
  } = { total: { increLine: 0, covLine: 0, increRate: '' }, files: [] };

  constructor(lcovPath: string, opts: BaseProcessOpts<T> = { stream: {} }) {
    if (typeof lcovPath !== 'string') {
      throw new Error('请传递 lcov 文件路径');
    }

    this.lcovPath = lcovPath;

    // 得到默认的开始日期
    const startDay = dayjs().startOf('month').format('YYYY-MM-DD');
    this.opts.cwd = opts.cwd || process.cwd();
    this.opts.since = opts.since || startDay;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.opts.stream.name = opts.stream.name || 'file';
    this.opts.stream.opts = opts.stream.opts;
  }

  async exec(): Promise<void> {
    await this.getLcov();

    await this.getLog();

    await this.getDiff();

    this.format();

    this.output();
  }

  /**
   * 得到 lcov 结果
   */
  private async getLcov() {
    this.lcov = await new LcovParser(this.lcovPath).run();
  }

  /**
   * 得到 GitLog 结果
   */
  private async getLog() {
    const res = await new LogParser({
      repo: this.opts.cwd as string,
      since: this.opts.since,
    }).run();

    this.firstGitMessage = res[res.length - 1];
  }

  /**
   * 得到 Git Diff 结果
   */
  private async getDiff() {
    this.diffData = await new DiffParser(this.firstGitMessage.hash as string, {
      cwd: this.opts.cwd,
    }).run();

    // TODO 待测试路径处理的正确性
    if (os.platform() === 'win32') {
      this.diffData = this.diffData.map((item) => {
        return {
          ...item,
          newPath: item.newPath.replace(/\\/g, '/'),
        };
      });
    }
  }

  /**
   * 进行格式化进行结果输出
   */
  private format() {
    Object.keys(this.lcov).forEach((lcovItem) => {
      this.diffData.forEach((diffItem) => {
        if (lcovItem.toLocaleLowerCase().includes(diffItem.newPath.toLocaleLowerCase())) {
          // 计算本文件的覆盖率
          const info = this.lcov[lcovItem] as DetailLines;
          const temp: {
            increLine: number;
            covLine: number;
            increRate: string;
            detail: { number: number; hits: number }[];
          } = { increLine: 0, covLine: 0, increRate: '', detail: [] };

          // 统计变换了的行号
          const diffLineArr: Array<number> = [];
          diffItem.hunks.forEach((hunk) => {
            hunk.changes.forEach((change) => {
              if (change.type === 'insert' && change.lineNumber) {
                diffLineArr.push(change.lineNumber);
              }
            });
          });

          // 统计每行对应的hit数
          const lcovLineHit: Record<string, number> = {};

          // 统计lcov中有记录的行
          const lcovLineArr: Array<number> = [];
          const details = info.lines;
          details.forEach((detail) => {
            const { hits } = detail;
            const { number } = detail;
            lcovLineHit[number] = hits;
            lcovLineArr.push(parseInt(number, 10));
          });

          // 求lcov与diff的交集
          const diffLineArrSet = new Set(diffLineArr);
          const intersectArr = lcovLineArr.filter((x) => diffLineArrSet.has(x));

          intersectArr.forEach((line: number) => {
            this.formatData.total.covLine += lcovLineHit[line] > 0 ? 1 : 0;
            temp.covLine += lcovLineHit[line] > 0 ? 1 : 0;
            temp.detail.push({
              number: line,
              hits: lcovLineHit[line],
            });
          });

          this.formatData.total.increLine += intersectArr.length;
          temp.increLine += intersectArr.length;

          temp.increRate = `${((temp.covLine / temp.increLine) * 100).toFixed(2)}%`;

          this.formatData.files.push(temp);
        }
      });
    });

    // 计算总覆盖率
    this.formatData.total.increRate = `${(
      (this.formatData.total.covLine / this.formatData.total.increLine) *
      100
    ).toFixed(2)}%`;
  }

  /**
   * 输出结果到对应的流
   */
  private output() {
    let tempStream: Stream;

    if (this.opts.stream?.name === 'file') {
      tempStream = new FileStream(this.formatData, this.opts.stream.opts);
    } else if (this.opts.stream?.name === 'stdio') {
      tempStream = new StdoutStream(this.formatData, this.opts.stream.opts);
    } else {
      throw new Error('参数错误');
    }

    tempStream.outToStream();
  }
}

export * from './async';
export * from './sync';
