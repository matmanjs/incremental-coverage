const fs = require('fs');
const { getIncrease, getFull } = require('incremental-coverage');

(async () => {
  await getIncrease(
    '../coverage/lcov.info',
    {
      output: true,
      stream: {
        name: 'file',
      },
      since: '2020-09-01',
      // hash: '24c145314936b01cd55912e140299c1dd9f3e79b',
    },
  );

  const res = await getFull([
    '../coverage/lcov.info',
  ]);

  fs.writeFileSync('./output1.json', JSON.stringify(res, null, 2));
})();
