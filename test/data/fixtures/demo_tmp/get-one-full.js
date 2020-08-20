const { e2eTestLcovFilePath, unitTestLcovFilePath, gitRootPath, incrementalCoverage } = require('./base');

const { getFull } = incrementalCoverage;

// 支持单文件
// 69: 121 / 144
getFull(e2eTestLcovFilePath)
  .then(data => {
    console.log('-- 支持单文件 69: 121 / 144--', data);
  })
  .catch(err => {
    console.error(err);
  });

// 支持多文件数组
// 69: 121 / 144
getFull(e2eTestLcovFilePath)
  .then(data => {
    console.log('-- 支持多文件数组 69: 121 / 144--', data);
  })
  .catch(err => {
    console.error(err);
  });

// 69: 32 / 104
getFull([unitTestLcovFilePath])
  .then(data => {
    console.log('--69: 32 / 104--', data);
  })
  .catch(err => {
    console.error(err);
  });
