const { e2eTestLcovFilePath, unitTestLcovFilePath, gitRootPath, incrementalCoverage } = require('./base');

const { getIncrease } = incrementalCoverage;

// 使用日期 since
// 69: 预期是 28 / 31
getIncrease([unitTestLcovFilePath, e2eTestLcovFilePath], {
  cwd: gitRootPath,
  since: '2020-08-01',
  output: false,
  stream: {},
})
  .then(data => {
    console.log('-- 使用日期 since: 预期是 28 / 31--', data);
  })
  .catch(err => {
    console.error(err);
  });

// 使用增量对比版本 hash
// 69: 预期是 28 / 31
getIncrease([e2eTestLcovFilePath, unitTestLcovFilePath], {
  cwd: gitRootPath,
  // since: '2020-08-01',
  hash: '44ac4fb6160c769b06fec754dc389c7d5b2c64d1',
  output: false,
  stream: {},
})
  .then(data => {
    console.log('-- 使用增量对比版本 hash 69: 预期是 28 / 31--', data);
  })
  .catch(err => {
    console.error(err);
  });
