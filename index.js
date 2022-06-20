const fs = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const random = (...arr) => {
  const index = parseInt((Math.random() * 100) % arr.length);
  return arr[index];
};

async function producer(pagination = 0) {
  await sleep(100);
  return {
    data: Array.from({ length: 100 }).map((_, i) => {
      return {
        id: i + pagination,
        timestamp: Date.now(),
        target: random('foo', 'bar', 'bazz', 'buzz', 'bizz'),
        actor: random('me', 'you', 'he', 'she', 'they', 'we'),
        data: random(
          'csacsacsacadsdwqewqlme',
          'qwewqdwqdsad',
          'sadsadwqelklkdjlhdsflkjlsf',
          'kdlsajdlsajldjsalkdwqhhejwql',
          'hnnncxvrwoueoqurjwqjljel',
          'dhflh3uoiq4uoi31uo43jdlksajlc'
        ),
      };
    }),
    pagination: pagination >= 1000_000 ? null : pagination + 100,
  };
}

async function* paginate(resume = null) {
  let result = null;
  while (result === null || result.pagination !== null) {
    result = await producer(result === null ? resume || 0 : result.pagination);
    yield result.data;
  }
  return result.data;
}

async function* convert(source) {
  for await (const page of source) {
    for (const item of page) {
      yield `${Object.values(item).join(';')}\n`;
    }
  }
}

(async () => {
  console.log(`start`);
  await pipelineAsync(
    paginate,
    convert,
    fs.createWriteStream('/tmp/output.csv')
  );
  console.log('end');
})();
