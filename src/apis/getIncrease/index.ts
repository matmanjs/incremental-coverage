import os from 'os';
import { execSync } from 'child_process';
import dayjs from 'dayjs';
import { File } from 'gitdiff-parser';
import { lcovConcat } from '../lcovConcat';
import { LogParser, DiffParser } from '../../parsers';
import { FileStreamOpt, StdoutStreamOpt, Stream, FileStream, StdoutStream } from '../../streams';
import { Lcov, CommitBase, FormatData, FirstInfo, IncreaseResult } from '../../types';

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
  since?: string;
  cwd?: string;
  output?: boolean;
  hash?: string;
  stream: {
    name?: T;
    opts?: T extends 'stdio' ? StdoutStreamOpt : FileStreamOpt;
  };
}

export class BaseProcess<T extends keyof Mapper> {
  lcovPath: string[];

  opts: BaseProcessOpts<T> = {
    stream: {},
  };

  private lcov: Lcov = { detail: {} };

  private firstGitMessage: CommitBase = {};

  private diffData: File[] = [];

  private formatData: FormatData = {
    total: { increLine: 0, covLine: 0, increRate: '' },
    files: [],
  };

  private firstInfo: FirstInfo | undefined;

  constructor(lcovPath: string | string[], opts: BaseProcessOpts<T> = { stream: {} }) {
    if (typeof lcovPath !== 'string') {
      throw new Error('请传递 lcov 文件路径');
    }

    if (typeof lcovPath === 'string') {
      this.lcovPath = [lcovPath];
    } else {
      this.lcovPath = lcovPath;
    }

    // 得到默认的开始日期
    const startDay = dayjs().startOf('month').format('YYYY-MM-DD');
    this.opts.cwd = opts.cwd || process.cwd();
    this.opts.since = opts.since || startDay;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.opts.stream.name = opts.stream.name || 'file';
    this.opts.stream.opts = opts.stream.opts;
    this.opts.output = opts.output;
    this.opts.hash = opts.hash;
  }

  async exec(): Promise<IncreaseResult> {
    await this.getLcov();

    if (this.opts.hash) {
      this.getInfoByHash(this.opts.hash);
    } else {
      await this.getLog();
    }

    await this.getDiff();

    this.format();

    this.createInfo();

    if (this.opts.output) {
      this.output();
    }

    return {
      data: this.formatData,
      commit: this.firstGitMessage,
      createInfo: this.firstInfo as FirstInfo,
    };
  }

  /**
   * 得到 lcov 结果
   */
  private async getLcov() {
    this.lcov = await lcovConcat(...this.lcovPath);
  }

  /**
   * 得到 GitLog 结果
   */
  private async getLog() {
    const subDate = dayjs(this.opts.since).subtract(1, 'day').format('YYYY-MM-DD');

    const res = await new LogParser({
      repo: this.opts.cwd as string,
      until: subDate,
    }).run();

    [this.firstGitMessage] = res;
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
    Object.keys(this.lcov.detail).forEach((lcovItem) => {
      this.diffData.forEach((diffItem) => {
        if (lcovItem.toLocaleLowerCase().includes(diffItem.newPath.toLocaleLowerCase())) {
          // 计算本文件的覆盖率
          const info = this.lcov.detail[lcovItem];
          const temp: {
            name: string;
            increLine: number;
            covLine: number;
            increRate: string;
            detail: { number: number; hits: number }[];
          } = { increLine: 0, covLine: 0, increRate: '', detail: [], name: lcovItem };

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
      tempStream = new FileStream(
        {
          data: this.formatData,
          commit: this.firstGitMessage,
          createInfo: this.firstInfo as FirstInfo,
        },
        this.opts.stream.opts,
      );
    } else if (this.opts.stream?.name === 'stdio') {
      tempStream = new StdoutStream(
        {
          data: this.formatData,
          commit: this.firstGitMessage,
          createInfo: this.firstInfo as FirstInfo,
        },
        this.opts.stream.opts,
      );
    } else {
      throw new Error('参数错误');
    }

    tempStream.outToStream();
  }

  /**
   * 得到仓库第一次提交的信息
   */
  private createInfo() {
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

  /**
   * 通过 hash 值得到本次提交的记录
   */
  private getInfoByHash(hash: string) {
    const res = execSync(`git log ${hash} --pretty="%H!!!%h!!!%aN!!!%aE!!!%ad!!!%B"`, {
      cwd: this.opts.cwd,
    })
      .toString()
      .split('\n');
    const first = res[0].split('!!!');

    this.firstGitMessage = {
      hash: first[0],
      abbrevHash: first[1],
      authorName: first[2],
      authorDate: first[4],
      subject: first[5],
    };
  }
}

export * from './async';
