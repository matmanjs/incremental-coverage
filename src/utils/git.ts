import { execSync } from "child_process";
import { FirstCommitInfo } from "../types";

/**
 * 获取当前git项目的根目录
 */
export function getGitRepoRootPath(cwd?: string): string {
  try {
    const res = execSync(`git rev-parse --show-toplevel`, {
      cwd: cwd || process.cwd(),
    })
      .toString()
      .split('\n');

    return res[0];
  } catch (e) {
    // 如果该执行模块没有在 git 项目内，则会抛出一个异常
    // Error: Command failed: git rev-parse --show-toplevel
    // fatal: not a git repository (or any of the parent directories): .git
    return '';
  }
}

/**
 * 得到仓库第一次提交的信息
 */
export function getGitRepoFirstCommitInfo(cwd?: string): FirstCommitInfo | undefined {
  try {
    const res = execSync('git log --reverse --pretty="%H!!!%h!!!%aN!!!%aE!!!%ad!!!%B"', {
      cwd: cwd || process.cwd(),
    })
      .toString()
      .split('\n');
    const first = res[0].split('!!!');

    return {
      hash: first[0],
      abbrevHash: first[1],
      authorName: first[2],
      authorEmail: first[3],
      authorDate: first[4],
      subject: first[5],
    };
  } catch (e) {
    // 可能当前并不是 git 项目
    return undefined;
  }
}
