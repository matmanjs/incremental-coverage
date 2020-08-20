const { e2eTestLcovFilePath, unitTestLcovFilePath, gitRootPath, incrementalCoverage } = require('./base');

const { getIncrease } = incrementalCoverage;

// u->e
// 69: 预期是 28 / 31
getIncrease([unitTestLcovFilePath, e2eTestLcovFilePath], {
  cwd: gitRootPath,
  since: '2020-08-01',
  output: false,
  stream: {},
})
  .then(data => {
    console.log('-- u->e 69: 预期是 28 / 31--', data);
  })
  .catch(err => {
    console.error(err);
  });

// e->u
// 69: 预期是 28 / 31
getIncrease([e2eTestLcovFilePath, unitTestLcovFilePath], {
  cwd: gitRootPath,
  since: '2020-08-01',
  output: false,
  stream: {},
})
  .then(data => {
    console.log('-- e->u 69: 预期是 28 / 31--', data);
  })
  .catch(err => {
    console.error(err);
  });
