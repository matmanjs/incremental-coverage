import { BaseProcess, BaseProcessOpts, Mapper } from './index';
import { LcovConcat } from '../../concat';
import { getLcovFile } from '../../utils/readLcov';
import { CommitInfo, FullResult } from '../../types';
import { getActualGitRepoRoot } from "../../utils";

export class FullProcess<T extends keyof Mapper> extends BaseProcess<T> {
  constructor(lcovPath: string | string[], opts: BaseProcessOpts<T> = { stream: {} }) {
    super();

    if (typeof lcovPath === 'string') {
      this.lcovPath = [lcovPath];
    } else {
      this.lcovPath = lcovPath;
    }

    this.opts.cwd = getActualGitRepoRoot(opts.cwd);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.opts.stream.name = opts.stream.name || 'file';
    this.opts.stream.opts = opts.stream.opts;
    this.opts.output = opts.output;
  }

  async exec(): Promise<FullResult> {
    // 将首次提交的代码信息当做创建信息
    let createInfo;

    // 得到创建信息
    if (this.opts.cwd) {
      createInfo = await this.getCreateInfo();

      if (createInfo) {
        this.firstInfo = createInfo as CommitInfo;
      }
    }

    // 得到全量合并结果
    await this.getLcov();

    this.format();

    if (this.opts.output) {
      this.output({
        data: this.formatData,
        createInfo,
      });
    }

    return {
      data: this.formatData,
      createInfo: createInfo ? (createInfo as CommitInfo) : undefined,
      gitRepoInfo: this.getGitRepoInfo()
    };
  }

  /**
   * 得到 lcov 结果
   */
  private async getLcov(): Promise<void> {
    const res = await getLcovFile(this.lcovPath);

    this.lcov = new LcovConcat().concat(...res).getRes();
  }
}
