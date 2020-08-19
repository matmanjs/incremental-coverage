const { e2eTestLcovFilePath, gitRootPath, incrementalCoverage } = require('./base');

const { getIncrease } = incrementalCoverage;

// 69: 24 / 31
getIncrease(e2eTestLcovFilePath,
  {
    cwd: gitRootPath,
    since: '2020-08-01',
    output: false,
    stream: {},
  },
)
  .then(data => {
    console.log('---', data);
  })
  .catch(err => {
    console.error(err);
  });

// 69: 24 / 31
getIncrease(e2eTestLcovFilePath,
  {
    cwd: gitRootPath,
    // since: '2020-08-01',
    hash: '44ac4fb6160c769b06fec754dc389c7d5b2c64d1',
    output: false,
    stream: {},
  },
)
  .then(data => {
    console.log('---', data);
  })
  .catch(err => {
    console.error(err);
  });
