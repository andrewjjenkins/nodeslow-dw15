// FooCo's main script.
//
'use strict';

var app = require('express')();
var Buffers = require('buffers');
var http = require('http');
var crypto = require('crypto');

var slices = [];
var maxClients = parseInt(process.env.CLIENTS) || 100;

var mockHandleOrder = function (orderBuf, cb) {
  cb();
};

app.route('/order').post(function (req, res, next) {
  if (!req.accepts('binary/octet-stream')) {
    res.writeHead(406);
    res.end();
    next();
  }
  var orderBufs = Buffers();
  req.on('data', function (d) { orderBufs.push(d); });
  req.on('end', function () {
    mockHandleOrder(orderBufs, function (err, result) {
      var firstTenBytes = new Buffer(10);
      orderBufs.copy(firstTenBytes, 0, 10);
      slices.push(firstTenBytes);
      //slices.push(orderBufs.slice(0, 10));
      if (err) {
        res.statusCode(500);
        res.end('Internal error: ' + err);
        return;
      }
      res.end('Order accepted');
      next();
    });
  });
});

var server = app.listen(3000, function () {
  console.log('listening');
  startMockClients();
});

// Mock
function startMockClients() {
  var buf = crypto.pseudoRandomBytes(9000);
  function runNewMockClient(cb) {
    http.request({ port: 3000, path: '/order', method: 'POST' },
      function (res) {
        res.on('end', function () {
          if (res.statusCode !== 200) {
            console.log('Client got HTTP ' + res.statusCode);
            cb(new Error('Order not accepted (' + res.statusCode + ')'));
          } else {
            cb();
          }
        });
        res.resume();
      }
    ).end(buf);
  }

  var clients = 0;
  function startNewClientIfNeeded(err) {
    if (clients < maxClients) {
      ++clients;
      runNewMockClient(startNewClientIfNeeded);
    } else {
      console.log('Done');
      server.close();
    }
  }
  startNewClientIfNeeded();
}
