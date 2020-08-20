import os from 'os';
import { File } from 'gitdiff-parser';
import { Concat } from './index';
import { LcovConcat } from './fullConcat';
import { DiffParser } from '../parsers';
import { Lcov, DetailLines } from '../types';

/**
 * 配置参数
 */
export interface IncreaseConcatOpts {
  cwd?: string;
  hash?: string;
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
    this.opts.cwd = opts.cwd || process.cwd();
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
      const info = this.res.detail[lcovItem];
      delete this.res.detail[lcovItem];

      this.diffData.forEach((diffItem) => {
        if (lcovItem.toLocaleLowerCase().includes(diffItem.newPath.toLocaleLowerCase())) {
          // 计算本文件的覆盖率
          const temp: DetailLines = {
            lineRate: 0,
            linesCovered: 0,
            linesValid: 0,
            lines: [],
          };

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