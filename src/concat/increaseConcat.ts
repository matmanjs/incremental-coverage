import os from 'os';
import { File } from 'gitdiff-parser';
import { Concat } from './index';
import { LcovConcat } from './fullConcat';
import { DiffParser } from '../parsers';
import { DetailLines, Lcov } from '../types';
import { getActualGitRepoRoot } from "../utils";

/**
 * 配置参数
 */
export interface IncreaseConcatOpts {
  cwd?: string;
  hash?: string;
}

interface LineNumberCheckItem {
  delete?: string,
  insert?: string,
  normal?: string,
}

export class IncreaseConcat implements Concat {
  // 配置
  private opts: IncreaseConcatOpts = {};

  // 结果
  private res: Lcov = {
    $: {
      linesCovered: 0,
      linesValid: 0,
    },
    detail: {},
  };

  // diff 完成的数据
  private diffData: File[] = [];

  constructor(opts: IncreaseConcatOpts = {}) {
    this.opts.cwd = getActualGitRepoRoot(opts.cwd);
    this.opts.hash = opts.hash;
  }

  async concat(...lcov: Lcov[]): Promise<IncreaseConcat> {
    this.getLcov(lcov);

    await this.getDiff();

    this.format();

    return this;
  }

  getRes(): Lcov {
    return this.res;
  }

  /**
   * 得到合并 lcov 结果
   */
  private getLcov(lcov: Lcov[]) {
    this.res = new LcovConcat().concat(...lcov).getRes();
  }

  /**
   * 得到 Git Diff 结果
   */
  private async getDiff() {
    this.diffData = await new DiffParser(this.opts.hash as string, {
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
    this.res.$ = {
      linesCovered: 0,
      linesValid: 0,
    };

    Object.keys(this.res.detail).forEach((lcovItem) => {
      // 单个文件A的覆盖率数据，无法阅读的数据
      const info = this.res.detail[lcovItem];
      delete this.res.detail[lcovItem];

      this.diffData.forEach((diffItem) => {
        // 注意 diffItem.newPath 有可能不存在，例如被删除的文件就木有
        if (lcovItem.toLocaleLowerCase().includes(diffItem.newPath?.toLocaleLowerCase())) {
          // 计算本文件的覆盖率
          const temp: DetailLines = {
            lineRate: 0,
            linesCovered: 0,
            linesValid: 0,
            lines: [],
          };

          // 统计变换了的行号
          const diffInsertLineArr: Array<number> = [];
          const lineNumberCheckMap: { [key: number]: LineNumberCheckItem } = {};

          diffItem.hunks.forEach((hunk) => {
            hunk.changes.forEach((change) => {
              if (!change.lineNumber) {
                return;
              }

              // 以行号为key，缓存下该行号 insert 或 delete 时的内容
              const lineNumberCheckItem: LineNumberCheckItem = lineNumberCheckMap[change.lineNumber] || {};
              lineNumberCheckItem[change.type] = change.content;
              lineNumberCheckMap[change.lineNumber] = lineNumberCheckItem;

              // 只需要判断 insert 类型且有行号的的结果即可，
              // 毕竟计算增量的目的是为了看存在，所以 delete 类型的不需要计算
              if ((change.type === 'insert')) {
                diffInsertLineArr.push(change.lineNumber);
              }
            });
          });

          // 注意一种特殊情况，如果某行既是 insert 且又是 delete，且 content 内容还是一模一样，则忽略该情况
          // 公司内的增量覆盖率算法为上述处理策略，因此此处做统一，
          // 虽然个人觉得不太合理，感觉只要是 delete 和 insert 应该都算增量变化，但需进一步研究
          // 统计变换了的行号
          const diffLineArr: Array<number> = [];
          diffInsertLineArr.forEach((lineNumber) => {
            const lineNumberCheckItem: LineNumberCheckItem = lineNumberCheckMap[lineNumber];

            if (!lineNumberCheckItem) {
              return;
            }

            if (lineNumberCheckItem.insert && lineNumberCheckItem.delete && (lineNumberCheckItem.insert === lineNumberCheckItem.delete)) {
              return;
            }

            diffLineArr.push(lineNumber);
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
            this.res.$.linesCovered += lcovLineHit[line] > 0 ? 1 : 0;
            temp.linesCovered += lcovLineHit[line] > 0 ? 1 : 0;
            temp.lines.push({
              number: line.toString(),
              hits: lcovLineHit[line],
            });
          });

          this.res.$.linesValid += intersectArr.length;
          temp.linesValid += intersectArr.length;
          temp.lineRate = temp.linesCovered / temp.linesValid;

          this.res.detail[lcovItem] = temp;
        }
      });
    });
  }
}
