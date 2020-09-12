import { execSync, spawn, SpawnOptionsWithoutStdio } from "child_process";
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
export async function getGitRepoFirstCommitInfo(cwd?: string): Promise<CommitInfo | null> {
  try {
    const runResult = await runBySpawn('git log --reverse --pretty="%H!!!%h!!!%aN!!!%aE!!!%ad!!!%B"', [], {
      cwd: cwd || process.cwd(),
    });

    const res = runResult.toString().split('\n');

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
export async function getGitRepoCommitInfoByHash(hash: string, cwd?: string): Promise<CommitInfo | null> {
  try {
    const runResult = await runBySpawn(`git log ${hash} --pretty="%H!!!%h!!!%aN!!!%aE!!!%ad!!!%B"`, [], {
      cwd: cwd || process.cwd(),
    });

    const res = runResult.toString().split('\n');

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
 * 使用 spawn 来执行指定的命令
 * @param {String} command
 * @param {Object} args
 * @param {Object} [options]
 * @return {Promise}
 */
export function runBySpawn(
  command: string,
  args?: string[],
  options?: SpawnOptionsWithoutStdio,
): Promise<string> {
  return new Promise((resolve) => {
    // https://nodejs.org/dist/latest-v10.x/docs/api/child_process.html#child_process_child_process_spawn_command_args_options
    const cmd = spawn(command, args, {
      ...options,
      // windows 中如果不设置它的话会出错
      shell: true,
    });

    let result = '';

    // 增加一个超时限制
    const checkT = setTimeout(() => {
      resolve(result);
    }, 5000);

    cmd.stdout.on('data', (data) => {
      result += data;
    });

    cmd.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    cmd.on('close', (code) => {
      if (code) {
        console.error(`${command} close: ${code}`);
      }

      clearTimeout(checkT);
      resolve(result);
    });
  });
}
