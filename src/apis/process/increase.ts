/* eslint-disable no-restricted-syntax */
import dayjs from 'dayjs';
import { execSync } from 'child_process';
import { BaseProcess, BaseProcessOpts, Mapper } from './index';
import { IncreaseConcat } from '../../concat';
import { LogParser } from '../../parsers';
import { getLcovFile } from '../../utils/readLcov';
import { CommitBase, FirstInfo, IncreaseResult } from '../../types';

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

  private firstGitMessage: CommitBase = {};

  constructor(lcovPath: string | string[], opts: IncreaseProcessOpts<T> = { stream: {} }) {
    super();

    if (typeof lcovPath === 'string') {
      this.lcovPath = [lcovPath];
    } else {
      this.lcovPath = lcovPath;
    }

    // 得到默认的开始日期
    const startDay = dayjs().startOf('month').format('YYYY-MM-DD');
    this.opts.cwd = opts.cwd;
    this.opts.since = opts.since || startDay;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.opts.stream.name = opts.stream.name || 'file';
    this.opts.stream.opts = opts.stream.opts;
    this.opts.output = opts.output;
    this.opts.hash = opts.hash;

    // 有可能用户没有传递 opts.cwd 参数进来，需要设置一些默认值
    if (!this.opts.cwd) {
      // 尝试去获取当前 git 项目的根目录
      const gitRepoRootPath = this.getGitRepoRootPath();
      if (gitRepoRootPath) {
        this.opts.cwd = gitRepoRootPath;
      } else {
        this.opts.cwd = process.cwd();
      }
    }
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
      this.output({
        data: this.formatData,
        commit: this.firstGitMessage,
        createInfo: this.firstInfo as FirstInfo,
      });
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

  /**
   * 获取当前git项目的根目录
   */
  private getGitRepoRootPath() {
    try {
      const res = execSync(`git rev-parse --show-toplevel`, {
        cwd: this.opts.cwd,
      })
        .toString()
        .split('\n');

      return res[0];
    } catch (e) {
      // 如果该执行模块没有在 git 项目内，则会抛出一个异常
      // Error: Command failed: git rev-parse --show-toplevel
      // fatal: not a git repository (or any of the parent directories): .git
      return null;
    }
  }
}
