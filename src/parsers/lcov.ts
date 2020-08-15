import fs from 'fs-extra';
import { Parser } from './index';
import { Lcov, DetailLines } from '../types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/order
import parse = require('lcov-parse');

/**
 * 对 lcov 文件进行格式化
 */
export class LcovParser implements Parser {
  path: string;

  parserRes: any;

  constructor(path: string) {
    if (!path || !(typeof path === 'string')) {
      throw new Error('请传递 string');
    }
    if (!fs.existsSync(path) || !fs.statSync(path).isFile()) {
      throw new Error('文件不存在');
    }

    this.path = path;
  }

  async run(): Promise<Lcov> {
    await this.parserLcov();
    return this.format();
  }

  /**
   * 格式化文件
   */
  private async parserLcov() {
    this.parserRes = await new Promise((resolve, reject) => {
      parse(this.path, (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  /**
   * 将文件格式化为需要的格式
   */
  private format(): Lcov {
    const lcov: Lcov = { detail: {} };
    let found = 0;
    let hit = 0;

    this.parserRes.forEach((item: any) => {
      found += item.lines.found;
      hit += item.lines.hit;
      const temp: DetailLines = {
        linesCovered: item.lines.hit,
        linesValid: item.lines.found,
        lineRate: item.lines.hit / item.lines.found,
        lines: [],
      };

      item.lines.details.forEach((detail: any) => {
        temp.lines.push({
          number: detail.line,
          hits: detail.hit,
          branch: '',
        });
      });

      lcov.detail[item.file] = temp;
    });

    lcov.$ = {
      linesValid: found,
      linesCovered: hit,
    };

    return lcov;
  }
}
