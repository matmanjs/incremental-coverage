/* eslint-disable no-restricted-syntax */
import dayjs from 'dayjs';
import { BaseProcess, BaseProcessOpts, Mapper } from './index';
import { IncreaseConcat } from '../../concat';
import { LogParser } from '../../parsers';
import { getLcovFile } from '../../utils/readLcov';
import { CommitInfo, IncreaseResult } from '../../types';
import { getActualGitRepoRoot } from "../../utils";
import { getGitRepoCommitInfoByHash } from "../../utils/git";

/**
 * BaseProcess 的配置参数
 */
export interface IncreaseProcessOpts<T extends keyof Mapper> extends BaseProcessOpts<T> {
  since?: string;
  hash?: string;
}

export class IncreaseProcess<T extends keyof Mapper> extends BaseProcess<T> {
  opts: IncreaseProcessOpts<T> = {
    stream: {},
  };

  private firstGitMessage: CommitInfo = {};

  constructor(lcovPath: string | string[], opts: IncreaseProcessOpts<T> = { stream: {} }) {
    super();

    if (typeof lcovPath === 'string') {
      this.lcovPath = [lcovPath];
    } else {
      this.lcovPath = lcovPath;
    }

    // 得到默认的开始日期
    const startDay = dayjs().startOf('month').format('YYYY-MM-DD');
    this.opts.cwd = getActualGitRepoRoot(opts.cwd);
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

    if (!this.opts.cwd) {
      throw new Error('must pass a git dir');
    }

    // 将首次提交的代码信息当做创建信息
    const createInfo = this.getCreateInfo() as CommitInfo;

    // 得到创建信息
    this.firstInfo = createInfo;

    // 得到增量合并结果
    await this.getLcov();

    this.format();

    if (this.opts.output) {
      this.output({
        data: this.formatData,
        commit: this.firstGitMessage,
        createInfo,
      });
    }

    return {
      data: this.formatData,
      commit: this.firstGitMessage,
      createInfo,
      gitRepoInfo: this.getGitRepoInfo()
    };
  }

  /**
   * 得到 lcov 结果
   */
  private async getLcov() {
    const res = await getLcovFile(this.lcovPath);

    this.lcov = (
      await new IncreaseConcat({
        cwd: this.opts.cwd,
        hash: this.firstGitMessage.hash,
      }).concat(...res)
    ).getRes();
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
   * 通过 hash 值得到本次提交的记录
   */
  private getInfoByHash(hash: string) {
    const result = getGitRepoCommitInfoByHash(hash, this.opts.cwd);

    if (result) {
      this.firstGitMessage = result;
    }
  }
}
