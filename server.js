const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const data = [
  'csacsacsacadsdwqewqlme',
  'lwqelwqjelkcbskcbkdsfkjqwewqdwqdsad',
  'sadsadwqelklkdjlhdsflkweqewqejlsf',
  'kdlsajdlsajldjsalkdwqhhejwql',
  'hnnncxvrwoueoqurjwqjljel',
  'dhflh3uoiq4uoi31uo43jdlksajlc',
  'lhjsaldjlkqjelwqeoiwquljdslfjlkdsjflkjewrjpoieqjrslvkjlkjbvlkjfeljrlkejrql32',
  'lhjsaldjlkqjelwqeoiwquljdslfvcxveqjrslvkjlkjbvlkjfeljrlkejrql32',
  'rjpoieqjrslvkjlkewqewqewq21321iujohlkjlkjbvlkjfeljrlkejrql32',
];

const random = () => {
  const index = parseInt((Math.random() * 100) % data.length);
  return data[index];
};

async function producer(next = 0) {
  await sleep(Math.random() * parseInt(process.env.SLEEP || 100));
  console.log({ next, limit: parseInt(process.env.LIMIT) });
  return {
    data: Array.from({ length: 100 }).map((_, i) => {
      return {
        id: i + next,
        timestamp: Date.now(),
        target: random(),
        actor: random(),
        foo: random(),
        bar: random(),
        bazz: random(),
        p: {
          something: random(),
          thing: random(),
          [random()]: random(),
          [random()]: random(),
          [random()]: random(),
        },
        n: {
          anything: random(),
          nothing: random(),
          [random()]: random(),
          [random()]: random(),
          [random()]: random(),
        },
      };
    }),
    next: next >= parseInt(process.env.LIMIT || 1000) ? null : next + 100,
  };
}

require('http')
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    console.log(req.url);
    producer(parseInt(url.searchParams.get('next')) || 0).then((result) => {
      res
        .writeHead(200, { 'content-type': 'application/json' })
        .end(JSON.stringify(result));
    });
  })
  .listen(process.env.PORT || 3000);
