const { e2eTestLcovFilePath, unitTestLcovFilePath, gitRootPath, incrementalCoverage } = require('./base');

const { increaseLcovConcat } = incrementalCoverage;

// 支持单文件
// 69: 24 / 31
increaseLcovConcat(e2eTestLcovFilePath, {
  cwd: gitRootPath,
  since: '2020-08-01',
  output: false,
  stream: {},
})
  .then(data => {
    console.log('--支持单文件 69: 24 / 31--', data);
  })
  .catch(err => {
    console.error(err);
  });

// 支持多文件数组
// 69: 24 / 31
increaseLcovConcat([e2eTestLcovFilePath], {
  cwd: gitRootPath,
  since: '2020-08-01',
  output: false,
  stream: {},
})
  .then(data => {
    console.log('--支持多文件数组 69: 24 / 31--', data);
  })
  .catch(err => {
    console.error(err);
  });

// 69: 25 / 31
increaseLcovConcat([unitTestLcovFilePath], {
  cwd: gitRootPath,
  since: '2020-08-01',
  output: false,
  stream: {},
})
  .then(data => {
    console.log('--69: 25 / 31--', data);
  })
  .catch(err => {
    console.error(err);
  });
