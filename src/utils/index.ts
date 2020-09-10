// 自动算出当前仓库的根目录
import { getGitRepoRootPath } from "./git";

export function getActualGitRepoRoot(cwd?: string): string {
  return cwd || getGitRepoRootPath(cwd) || process.cwd();
}
