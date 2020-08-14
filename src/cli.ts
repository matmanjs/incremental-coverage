#!/usr/bin/env node
import yargs from 'yargs';
import { getIncrease } from './apis/getIncrease';

(async () => {
  const res = yargs
    .scriptName('git-parser')
    .usage('$0 [args]')
    .option('path', {
      alias: 'p',
      demandOption: true,
      describe: 'lcov.info 文件路径',
      type: 'string',
    })
    .option('time', {
      alias: 't',
      describe: '增量起始时间',
      type: 'string',
    })
    .option('output', {
      alias: 'o',
      describe: '选择输出方式',
      default: 'file',
      choices: ['file', 'stdio'],
    })
    .help().argv;

  await getIncrease(res.path, {
    since: res.time,
    output: true,
    stream: {
      name: res.output as 'file' | 'stdio',
    },
  });
})();
