const path = require('path');
// const incrementalCoverage = require('incremental-coverage');
const incrementalCoverage = require('../../../../');

module.exports = {
  unitTestLcovFilePath: path.join(__dirname, '../demo1/unit-test/lcov.info'),
  e2eTestLcovFilePath: path.join(__dirname, '../demo1/e2e-test/lcov.info'),
  gitRootPath: path.join(__dirname, '../../../../../web-test-demo'),
  incrementalCoverage
};
