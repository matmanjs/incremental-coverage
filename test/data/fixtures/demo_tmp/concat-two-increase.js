const { e2eTestLcovFilePath, unitTestLcovFilePath, gitRootPath, incrementalCoverage } = require('./base');

const { increaseLcovConcat } = incrementalCoverage;

// 69: 预期是 28 / 31
increaseLcovConcat([e2eTestLcovFilePath, unitTestLcovFilePath], {
  cwd: gitRootPath,
  since: '2020-08-01',
  output: false,
  stream: {},
})
  .then(data => {
    console.log('--69: 预期是 28 / 31--', data);
  })
  .catch(err => {
    console.error(err);
  });
