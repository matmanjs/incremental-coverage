const { e2eTestLcovFilePath, unitTestLcovFilePath, incrementalCoverage } = require('./base');

const { lcovConcat } = incrementalCoverage;

// 69: 预期是 126 / 145
lcovConcat(e2eTestLcovFilePath, unitTestLcovFilePath)
  .then(data => {
    console.log('---', data);
  })
  .catch(err => {
    console.error(err);
  });
