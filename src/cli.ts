#!/usr/bin/env node
import yargs from 'yargs';
import { getIncrease } from './apis';

(async () => {
  const res = yargs
    .scriptName('git-parser')
    .usage('$0 [args]')
    .option('path', {
      alias: 'p',
      demandOption: true,
      describe: 'lcov.info path',
      type: 'string',
    })
    .option('time', {
      alias: 't',
      describe: 'git diff start time',
      type: 'string',
    })
    .option('output', {
      alias: 'o',
      describe: 'switch stream',
      default: 'file',
      choices: ['file', 'stdio'],
    })
    .help().argv;

  await getIncrease(res.path, {
    since: res.time,
    stream: {
      name: res.output as 'file' | 'stdio',
    },
  });
})();
