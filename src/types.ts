// 覆盖率测试报告格式化数据结构
export interface Total {
  linesCovered: number;
  linesValid: number;
}

export interface DetailLines {
  linesCovered: number;
  linesValid: number;
  lineRate: number;
  lines: {
    branch: string;
    hits: number;
    number: string;
  }[];
}

export interface Locv {
  detail: Record<string, DetailLines>;
  $?: Total;
}
