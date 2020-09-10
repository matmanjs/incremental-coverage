import { BaseProcess, BaseProcessOpts, Mapper } from './index';
import { LcovConcat } from '../../concat';
import { getLcovFile } from '../../utils/readLcov';
import { FirstCommitInfo, FullResult } from '../../types';
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
    // 得到创建信息
    if (this.opts.cwd) {
      this.firstInfo = this.getCreateInfo();
    }

    // 得到全量合并结果
    await this.getLcov();

    this.format();

    // 处理下首次提交的代码信息
    const firstInfo = this.firstInfo ? (this.firstInfo as FirstCommitInfo) : undefined;

    if (this.opts.output) {
      this.output({
        data: this.formatData,
        createInfo: firstInfo,
      });
    }

    return {
      data: this.formatData,
      createInfo: firstInfo,
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
