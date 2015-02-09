var http = require('http');
var util = require('util');
var async = require('async');

function checkForPrime(x) {
  // Try it this faster way:
  //var sqrtX = Math.sqrt(x);
  //for (var i = 2; i < sqrtX; ++i) {

  for (var i = 2; i < x; ++i) {
    if ((x % i) === 0) {
      return false;
    }
  }
  return true;
}

function sendError(err, res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  console.log('Error: ', err);
  return res.end('Problem processing request: ' + err);
}

function handleRequest(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type' : 'text/plain' });
    return res.end('Only allow POSTing a JSON that is an array of numbers');
  }

  // Inefficient accumulation but small request body.
  var blobData = '';
  req.on('data', function (d) { blobData += d });
  req.on('end', function () {
    var ints;
    try {
      ints = JSON.parse(blobData);
    } catch (err) {
      return sendError('Cannot parse request body as JSON', res);
    }
    if (!util.isArray(ints)) {
      return sendError('Request body not an array of ints', res);
    }
    // FIXME: Do more checking that it is an array of ints here.
    var primes = ints.filter(checkForPrime);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(primes));
  });
}

var port;
var server = http.createServer(handleRequest).listen(0, function () {
  port = server.address().port;
  console.log('Server listening on port %d', port);
  startClient();
});

function startClient() {
  var bigTestCase = 
      [ 424113737373, 424313737731, 425313737731, 425913737113, 426113737371,
        427113737733, 427313733371, 428313737731, 428913737731, 429713737113 ];
  var reallyBigTestCase = bigTestCase.concat(bigTestCase);

  async.eachSeries([
      [ 42 ],
      [ 37, 101, 40, 113, 7 ],
      [ 4241, 4243, 4253, 4259, 4261, 4271, 4273, 4283, 4289, 4297 ],
      bigTestCase,
      reallyBigTestCase,
  ], function makeRequest(ints, cb) {
    var req = http.request({
      host: 'localhost',
      port: port,
      method: 'POST'
    }, function handleClientResponse(res) {
      var resBlob = '';
      res.on('data', function (d) { resBlob += d; });
      res.on('end', function () {
        var primes;
        try {
          primes = JSON.parse(resBlob);
        } catch (err) {
          console.log('Failed to parse response as JSON');
          cb();
        }
        if (primes.length === 0) {
          console.log('%s has no primes', ints);
        } else {
          console.log('%s has primes %s', ints, primes);
        }
        cb();
      });
    });

    req.end(JSON.stringify(ints));
  }, function doneCb() {
    console.log('Done with primes, looping');
    startClient();
  });
}
