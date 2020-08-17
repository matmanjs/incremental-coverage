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
    hits: number;
    number: string;
  }[];
}

export interface Lcov {
  detail: Record<string, DetailLines>;
  $?: Total;
}
