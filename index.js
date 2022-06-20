const { pipeline, PassThrough } = require('stream');
const { promisify } = require('util');
const aws = require('aws-sdk');
const fetch = require('node-fetch');
const pipelineAsync = promisify(pipeline);

async function* paginate(resume = null) {
  let result = null;
  while (result === null || result.next !== null) {
    result = await fetch(
      result === null
        ? `http://localhost:3000`
        : `http://localhost:3000/?next=${result.next}`
    ).then((x) => x.json());
    console.log({ next: result.next });
    yield result.data;
  }
  return result.data;
}

async function* convert(source) {
  for await (const page of source) {
    for (const item of page) {
      yield `${Object.values(item)
        .map((x) => (typeof x === typeof {} ? JSON.stringify(x) : x))
        .join(';')}\n`;
    }
  }
}

(async () => {
  const s3Stream = new PassThrough();
  const s3 = new aws.S3();
  const s3Upload = s3
    .upload({
      Bucket: 'balazs4-generator',
      Key: `s3.csv`,
      Body: s3Stream,
    })
    .promise();

  const [pipelineResult, s3Result] = await Promise.all([
    pipelineAsync(paginate, convert, s3Stream),
    s3Upload,
  ]);

  const { heapUsed } = process.memoryUsage();
  console.log({ s3Result, heapUsed: heapUsed / (1024 * 1024) });
})();
