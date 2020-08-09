import dayjs from 'dayjs';
import { File } from 'gitdiff-parser';
import { LcovParser, LogParser, DiffParser } from '../parsers';
import { FileStreamOpt, StdoutStreamOpt } from '../streams';
import { Info } from '../types';

interface Mapper {
  stuio: StdoutStreamOpt;
  file: FileStreamOpt;
}

interface BaseProcessOpts<T extends keyof Mapper> {
  since?: string;
  cwd?: string;
  stream?: {
    name: T;
    opts: T extends 'stdio' ? StdoutStreamOpt : FileStreamOpt;
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

  opts: BaseProcessOpts<T> = {};

  private lcov: Info = {};

  private firstGitMessage: CommitBase = {};

  private diffRes: File[] = [];

  constructor(lcovPath: string, opts: BaseProcessOpts<T> = {}) {
    if (typeof lcovPath !== 'string') {
      throw new Error('请传递 lcov 文件路径');
    }

    this.lcovPath = lcovPath;

    // 得到默认的开始日期
    const startDay = dayjs().startOf('month').format('YYYY-MM-DD');
    this.opts.cwd = opts.cwd || process.cwd();
    this.opts.since = opts.since || startDay;
  }

  async exec(): Promise<void> {
    this.getLcov();

    this.getLog();

    this.getDiff();
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
    this.diffRes = await new DiffParser(this.firstGitMessage.hash as string, {
      cwd: this.opts.cwd,
    }).run();
  }
}
