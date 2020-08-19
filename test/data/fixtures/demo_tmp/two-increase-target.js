const { e2eTestLcovFilePath, unitTestLcovFilePath, gitRootPath, incrementalCoverage } = require('./base');

const { increaseLcovConcat } = incrementalCoverage;

// 69: 预期是 28 / 31
increaseLcovConcat({
  cwd: gitRootPath,
  since: '2020-08-01',
  output: false,
  stream: {},
}, e2eTestLcovFilePath, unitTestLcovFilePath)
  .then(data => {
    console.log('---', data);
  })
  .catch(err => {
    console.error(err);
  });

// 69: 预期是 28 / 31
increaseLcovConcat({
  cwd: gitRootPath,
  // since: '2020-08-01',
  hash: '44ac4fb6160c769b06fec754dc389c7d5b2c64d1',
  output: false,
  stream: {},
}, e2eTestLcovFilePath, unitTestLcovFilePath)
  .then(data => {
    console.log('--hash--', data);
  })
  .catch(err => {
    console.error(err);
  });
