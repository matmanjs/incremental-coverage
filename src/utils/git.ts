import { execSync } from "child_process";
import { CommitInfo } from "../types";

/**
 * 获取当前git项目的分支名
 */
export function getGitRepoRemoteUrl(cwd?: string): string {
  try {
    const res = execSync(`git remote -v`, {
      cwd: cwd || process.cwd(),
    })
      .toString()
      .split('\n');

    /*
    origin  https://github.com/matmanjs/incremental-coverage.git (fetch)
    origin  https://github.com/matmanjs/incremental-coverage.git (push)
    */

    const matchResult = res[0].trim().match(/[^\s]*\s+(.*)\s+\(.*/i);

    return matchResult && matchResult[1] || '';
  } catch (e) {
    // 如果该执行模块没有在 git 项目内，则会抛出一个异常
    // Error: Command failed: git rev-parse --show-toplevel
    // fatal: not a git repository (or any of the parent directories): .git
    return '';
  }
}

/**
 * 获取当前git项目的分支名
 */
export function getGitRepoCurrentBranch(cwd?: string): string {
  try {
    const res = execSync(`git symbolic-ref --short -q HEAD`, {
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
export function getGitRepoFirstCommitInfo(cwd?: string): CommitInfo | null {
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
    return null;
  }
}

/**
 * 通过 hash 值得到本次提交的记录
 */
export function getGitRepoCommitInfoByHash(hash: string, cwd?: string): CommitInfo | null {
  try {
    const res = execSync(`git log ${hash} --pretty="%H!!!%h!!!%aN!!!%aE!!!%ad!!!%B"`, {
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
    return null;
  }
}
