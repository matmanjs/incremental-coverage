const { e2eTestLcovFilePath, unitTestLcovFilePath, incrementalCoverage } = require('./base');

const { lcovConcat } = incrementalCoverage;

// 69: 121 / 144
lcovConcat(e2eTestLcovFilePath)
  .then(data => {
    console.log('---', data);
  })
  .catch(err => {
    console.error(err);
  });

// 69: 32 / 104
lcovConcat(unitTestLcovFilePath)
  .then(data => {
    console.log('---', data);
  })
  .catch(err => {
    console.error(err);
  });
