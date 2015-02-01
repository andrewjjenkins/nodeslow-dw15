var http = require('http');

// Run this with --expose_gc.  But if you don't, don't crash.
if (!global.gc) {
   global.gc = function () { console.log('Cannot force gc'); };
}

function processTheRequest(req) {
  // This function could do anything.  In many practical cases, it would
  // be async as well.  For this example, it just returns a large object.
  var toReturn = {};
  for (var i = 0; i < 1000; ++i) {
    toReturn[i] = {};
    for (var j = 0; j < 100; ++j) {
      toReturn[i][j] = new Array(101).join('' + i + '' + j);
    }
  }
  console.log('Made a large object');
  return toReturn;
}

function handleTheRequest0(req, res) {
  var largeObject = processTheRequest(req);

  req.on('end', function handleRequestDone0() {
    delete largeObject[0][0];
    // The closure for handleRequestDone1 includes largeObject AND we use it.
    // gc() will not be able to get it.
    gc();
    console.log('Ran GC; did it get largeObject?');
  });
  res.end();
}

function handleRequestDone1() {
    // The closure for handleRequestDone2 does not include largeObject.
    // gc() WILL be able to get it (it may have gotten it already).
    gc();
    console.log('Ran GC; did it get largeObject?');
}

function handleTheRequest1(req, res) {
  var largeObject = processTheRequest(req);
  req.on('end', handleRequestDone1);
  res.end();
}

function handleTheRequest2(req, res) {
  var reqData = { largeObject : processTheRequest(req),
                  arrival : process.hrtime() };
  req.on('end', function handleRequestDone2() {
    var elapsed = process.hrtime(reqData.arrival);
    gc();
    console.log('Ran GC; did it get large object? (%d ns)',
                elapsed[0] * 1e9 + elapsed[1]);
  });
  res.end();
}

var requestHandlers = [ handleTheRequest0,
                        handleTheRequest1,
                        handleTheRequest2 ];
var handleTheRequest = requestHandlers[0];
if (process.env.ASYNC) {
  handleTheRequest = requestHandlers[parseInt(process.env.ASYNC)];
}

var server = http.createServer(handleTheRequest).listen(0, function () {
  var port = server.address().port;
  console.log('Listening on ' + port);
  http.get('http://localhost:' + port, function (res) {
    res.resume();
    res.on('end', function () {
      console.log('Response complete');
      server.close();
    });
  });
});
