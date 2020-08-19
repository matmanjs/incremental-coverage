const { e2eTestLcovFilePath, unitTestLcovFilePath, gitRootPath, incrementalCoverage } = require('./base');

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

// 69: 25 / 31
getIncrease(unitTestLcovFilePath, {
  cwd: gitRootPath,
  since: '2020-08-01',
  output: false,
  stream: {},
})
  .then(data => {
    console.log('---', data);
  })
  .catch(err => {
    console.error(err);
  });
