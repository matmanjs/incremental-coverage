/* eslint-disable no-restricted-syntax */
import path from 'path';
import { Lcov } from '../../types';
import { LcovConcat } from './concat';
import { LcovParser } from '../../parsers';
import { BaseProcess, BaseProcessOpts, Mapper } from '../getIncrease';

export * from './concat';

/**
 * 输出合并之后的文件
 * @param lcovPath lcov文件路径
 */
export async function lcovConcat(...lcovPath: string[]): Promise<Lcov> {
  // 去掉重复文件
  const lcovSet = new Set<string>();
  for (const item of lcovPath) {
    lcovSet.add(path.resolve(item));
  }

  // 并行格式化
  const parserPromise: Promise<Lcov>[] = [];
  for (const item of lcovSet) {
    parserPromise.push(new LcovParser(item).run());
  }

  const res = await Promise.all(parserPromise);

  return new LcovConcat().concat(...res).getRes();
}

/**
 * 输出合并之后的文件
 * @param opts
 * @param lcovPath lcov文件路径
 */
export async function increaseLcovConcat<T extends keyof Mapper>(
  opts: BaseProcessOpts<T>,
  ...lcovPath: string[]
): Promise<Lcov> {
  // 去掉重复文件
  const lcovSet = new Set<string>();
  for (const item of lcovPath) {
    lcovSet.add(path.resolve(item));
  }

  // 并行格式化, 这里又把数据结构还原回去
  // 有点愚蠢
  const parserPromise: Promise<Lcov>[] = [];
  for (const item of lcovSet) {
    parserPromise.push(
      (async () => {
        const format = await new BaseProcess(item, opts).exec();
        const temp: Lcov = {
          $: {
            linesCovered: format.data.total.covLine,
            linesValid: format.data.total.increLine,
          },
          detail: {},
          increaseResultList: []
        };

        for (const formatItem of format.data.files) {
          const rate = formatItem.increRate?.substr(0, formatItem.increRate?.length - 1);
          const detail: {
            hits: number;
            number: string;
          }[] = [];

          if (formatItem.detail) {
            for (const detailItem of formatItem.detail) {
              detail.push({
                hits: detailItem.hits,
                number: detailItem.number.toString(),
              });
            }
          }

          temp.detail[formatItem.name] = {
            linesValid: formatItem.increLine as number,
            linesCovered: formatItem.covLine as number,
            lineRate: +(rate as string),
            lines: detail,
          };

          temp.increaseResultList?.push(format);
        }

        return temp;
      })(),
    );
  }

  const res = await Promise.all(parserPromise);

  return new LcovConcat().concat(...res).getRes();
}
