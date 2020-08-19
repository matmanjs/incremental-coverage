import { execSync } from 'child_process';
import dayjs from 'dayjs';
import { increaseLcovConcat } from '../lcovConcat';
import { LogParser } from '../../parsers';
import { FileStream, FileStreamOpt, StdoutStream, StdoutStreamOpt, Stream } from '../../streams';
import { CommitBase, FirstInfo, FormatData, IncreaseResult, Lcov } from '../../types';

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

  private lcov: Lcov = { $: { linesCovered: 0, linesValid: 0 }, detail: {} };

  private firstGitMessage: CommitBase = {};

  private formatData: FormatData = {
    total: { increLine: 0, covLine: 0, increRate: '' },
    files: [],
  };

  private firstInfo: FirstInfo | undefined;

  constructor(lcovPath: string | string[], opts: BaseProcessOpts<T> = { stream: {} }) {
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
    // 得到本次 diff 信息
    if (this.opts.hash) {
      this.getInfoByHash(this.opts.hash);
    } else {
      await this.getLog();
    }

    // 得到创建信息
    this.createInfo();

    // 得到增量合并结果
    await this.getLcov();

    this.format();

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
    this.lcov = await increaseLcovConcat(this.lcovPath, {
      cwd: this.opts.cwd,
      hash: this.firstGitMessage.hash,
    });
  }

  /**
   * 进行格式化进行结果输出
   */
  private format() {
    this.formatData.total.covLine = this.lcov.$.linesCovered;
    this.formatData.total.increLine = this.lcov.$.linesCovered;
    this.formatData.total.increRate = `${(
      (this.lcov.$.linesCovered / this.lcov.$.linesValid) *
      100
    ).toFixed(2)}%`;

    Object.entries(this.lcov.detail).forEach(([name, detail]) => {
      const temp: {
        name: string;
        increLine?: number;
        covLine?: number;
        increRate?: string;
        detail?: { number: number; hits: number }[];
      } = {
        name,
        increLine: detail.linesValid,
        covLine: detail.linesCovered,
        increRate: `${(detail.lineRate * 100).toFixed(2)}%`,
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
