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

  private baseDiffCommitInfo: CommitInfo | undefined;

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
    // 如果传递了 hash，则得到该提交记录
    if (this.opts.hash) {
      this.baseDiffCommitInfo = await this.getCommitInfoByHash(this.opts.hash);
    }

    // 如果通过 hash 无法获得，则自动获取指定日期的那次代码提交
    if (!this.baseDiffCommitInfo) {
      this.baseDiffCommitInfo = await this.getCommitInfoByLogSince();
    }

    if (!this.opts.cwd) {
      throw new Error('must pass a git dir');
    }

    // 将首次提交的代码信息当做创建信息
    const createInfo = await this.getCreateInfo() as CommitInfo;

    // 得到增量合并结果
    await this.getLcov();

    this.format();

    if (this.opts.output) {
      this.output({
        data: this.formatData,
        commit: this.baseDiffCommitInfo,
        createInfo,
      });
    }

    return {
      data: this.formatData,
      commit: this.baseDiffCommitInfo as CommitInfo,
      createInfo,
      gitRepoInfo: this.getGitRepoInfo()
    };
  }

  /**
   * 得到 lcov 结果
   */
  private async getLcov() {
    // 解析获得 lcov.info 的信息，这里是全量覆盖率信息
    const res = await getLcovFile(this.lcovPath);

    // 合并多个 lcov 文件
    const increaseConcat = await new IncreaseConcat({
      cwd: this.opts.cwd,
      hash: this.baseDiffCommitInfo?.hash,
    }).concat(...res);

    // 获得合并结果
    this.lcov = increaseConcat.getRes();
  }

  /**
   * 通过 GitLog 的 since 值得到本次提交的记录
   */
  private async getCommitInfoByLogSince(): Promise<(CommitInfo | undefined)> {
    // 获得当月1号
    const subDate = dayjs(this.opts.since).subtract(1, 'day').format('YYYY-MM-DD');

    const res = await new LogParser({
      repo: this.opts.cwd as string,

      // before: 该日期之前的记录，更新的排在前面
      // after: 该日期之后的记录，更新的排在前面
      before: subDate,
    }).run();

    // 返回第一个值
    return res[0];
  }

  /**
   * 通过 hash 值得到本次提交的记录
   */
  private async getCommitInfoByHash(hash: string): Promise<(CommitInfo | undefined)> {
    const result = await getGitRepoCommitInfoByHash(hash, this.opts.cwd);

    return result || undefined;
  }
}
