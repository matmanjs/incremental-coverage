const { e2eTestLcovFilePath, unitTestLcovFilePath, incrementalCoverage } = require('./base');

const { getFull } = incrementalCoverage;

// 69: 预期是 126 / 145
getFull([e2eTestLcovFilePath, unitTestLcovFilePath])
  .then(data => {
    console.log('--69: 预期是 126 / 145--', data);
  })
  .catch(err => {
    console.error(err);
  });
