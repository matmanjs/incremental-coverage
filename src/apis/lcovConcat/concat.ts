/* eslint-disable no-restricted-syntax */
import { DetailLines, Lcov } from '../../types';

export class LcovConcat {
  private res: Lcov | null = null;

  /**
   * 判断之前的对象中是否已经覆盖了这个文件
   * @param nowKey
   * @param once
   */
  private static judgeInOnce(nowKey: string, once: Record<string, DetailLines>): string {
    const tempNow = nowKey.toLowerCase();
    const onceArray = Object.keys(once);

    for (const key of onceArray) {
      const tempkey = key.toLowerCase();
      if (tempNow.includes(tempkey) || tempkey.includes(tempNow)) {
        return key;
      }
    }

    return '';
  }

  private static mergeFile(now: DetailLines, once: DetailLines): DetailLines {
    const res = { ...now };

    let linesCovered = 0;
    let linesValid = 0;

    // now 中有的项目进行合入
    for (const nowLine of res.lines) {
      for (const onceLine of once.lines) {
        if (+nowLine.number === +onceLine.number) {
          nowLine.hits += onceLine.hits;
          break;
        }
      }
    }

    // 只有 once 中有的项目合入
    for (const onceLine of once.lines) {
      let flag = false;
      for (const nowLine of res.lines) {
        if (+nowLine.number === +onceLine.number) {
          flag = true;
          break;
        }
      }

      if (!flag) {
        res.lines.push(onceLine);
      }
    }

    // 计算覆盖的行数
    for (const nowLine of res.lines) {
      if (nowLine.hits !== 0) {
        linesCovered += 1;
      }
      linesValid += 1;
    }

    res.linesCovered = linesCovered;
    res.linesValid = linesValid;
    res.lineRate = +(linesCovered / res.linesValid).toFixed(4);

    return res;
  }

  /**
   * 进行文件的合并
   * @param args
   */
  concat(...args: Lcov[]): LcovConcat {
    let lcov = args;

    if (this.res === null) {
      [this.res] = lcov;
      lcov = lcov.slice(1);
    }

    const once = this.res.detail;

    // 遍历所有传入的 lcov 文件
    lcov.forEach((item) => {
      // 将新的文件进行合入
      Object.keys(item.detail).forEach((nowItem) => {
        const onceKey = LcovConcat.judgeInOnce(nowItem, once);

        if (onceKey !== '') {
          // 如果在之前的已经存在就进行合并
          // 去除需要被合并的旧值
          const onceVal = once[onceKey];
          delete once[onceKey];

          // 得到最后合入的 Key
          const resKey = nowItem.length > onceKey.length ? nowItem : onceKey;
          const resVal = LcovConcat.mergeFile(item.detail[nowItem], onceVal);

          once[resKey] = resVal;
        } else {
          // 不存在直接合入
          once[nowItem] = item.detail[nowItem];
        }
      });
    });

    // 计算总的覆盖率数据
    let linesCovered = 0;
    let linesValid = 0;

    Object.keys(once).forEach((item) => {
      linesCovered += once[item].linesCovered;
      linesValid += once[item].linesValid;
    });

    this.res = {
      $: {
        linesCovered,
        linesValid,
      },
      detail: once,
    };

    return this;
  }

  getRes(): Lcov {
    return this.res ? this.res : { detail: {} };
  }
}
