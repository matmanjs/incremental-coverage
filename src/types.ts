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
 * 代码提交信息
 * {
  hash: '8996d46d817ee6d666ce286009a45fcd1ae06a36',
  abbrevHash: '8996d46',
  authorName: 'abc',
  authorEmail: 'abc@qq.com',
  authorDate: 'Fri Aug 7 10:22:15 2020 +0800',
  subject: 'feat: 初始化项目'
}
 */
export interface CommitInfo {
  hash?: string;
  abbrevHash?: string;
  subject?: string;
  authorName?: string;
  authorDate?: string;
  authorEmail?: string;
}

/**
 * 当前仓库的基本信息
 */
export interface GitRepoInfo {
  remoteUrl: string;
  branch: string;
}

/**
 * 最后返回的仓库增量信息
 */
export interface IncreaseResult {
  data: FormatData;
  commit: CommitInfo;
  createInfo: CommitInfo;
  gitRepoInfo: GitRepoInfo;
}

/**
 * 最后返回的仓库全量信息
 */
export interface FullResult {
  data: FormatData;
  createInfo?: CommitInfo;
  gitRepoInfo: GitRepoInfo;
}
