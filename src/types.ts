/**
 * Lcov 格式化时候的总数据
 */
export interface Total {
  linesCovered: number;
  linesValid: number;
}

/**
 * Lcov 格式化之后的每个文件的详细数据
 */
export interface DetailLines {
  linesCovered: number;
  linesValid: number;
  lineRate: number;
  lines: {
    hits: number;
    number: string;
  }[];
}

/**
 * 格式化之后的 Lcov
 */
export interface Lcov {
  detail: Record<string, DetailLines>;
  $: Total;
}

/**
 * 经过增量 Diff 的格式化数据
 */
export interface FormatData {
  total: {
    line: number;
    covLine: number;
    rate: string;
  };
  files: {
    name: string;
    line?: number;
    covLine?: number;
    rate?: string;
    detail?: { number: number; hits: number }[];
  }[];
}

/**
 * 进行 Diff 的那次提交的信息
 */
export interface CommitBase {
  files?: string[];
  abbrevHash?: string;
  hash?: string;
  subject?: string;
  authorName?: string;
  authorDate?: string;
}

/**
 * 第一次仓库的提交信息
 */
export interface FirstCommitInfo {
  hash?: string;
  abbrevHash?: string;
  subject?: string;
  authorName?: string;
  authorDate?: string;
  authorEmail?: string;
}

/**
 * 最后返回的仓库增量信息
 */
export interface IncreaseResult {
  data: FormatData;
  commit: CommitBase;
  createInfo: FirstCommitInfo;
}

/**
 * 最后返回的仓库全量信息
 */
export interface FullResult {
  data: FormatData;
  createInfo?: FirstCommitInfo;
}
