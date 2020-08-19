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
