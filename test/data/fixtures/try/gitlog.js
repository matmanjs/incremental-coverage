const path = require('path');
const { gitlogPromise } = require('gitlog');

const options = {
  repo: path.join(__dirname, '../../'),
  number: 10,
  // until: '2020-08-31',
  before: '2020-09-01',
};

(async () => {

  // 压缩单元测试产物
  const commits = await gitlogPromise(options);

  commits.forEach((commit)=>{
    console.log(`${commit.abbrevHash} : ${commit.authorDate}`)
  })

})();
