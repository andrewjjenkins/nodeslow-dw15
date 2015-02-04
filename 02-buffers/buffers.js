'use strict';
var fs = require('fs');
var requestsToProcess = parseInt(process.env.REQS) || 1e5;
var requestSize = parseInt(process.env.SIZE) || 10*1024;

// Can be 'slice', 'copy', 'copyPrealloc', or 'copyPreallocNoSlice'
var strategy = process.env.STRATEGY || 'slice';

function handleReqData(reqData, cb) {
  xactionSummaries.store(reqData);

  // Do normal processing.

  // Call callback.
  process.nextTick(cb);
}


function XactionSummary() {
  this.xactions = [];
  if (strategy === 'copyPrealloc' || strategy === 'copyPreallocNoSlice') {
    this.buf = new Buffer(10 * requestsToProcess);
    this.bufCursor = 0;
  }
}
XactionSummary.prototype.store = function (data) {
  if (strategy === 'slice' || !strategy) {
    this.xactions.push(data.slice(0, 10));
  } else if (strategy === 'copy') {
    var summaryBuf = new Buffer(10);
    data.copy(summaryBuf, 0, 10);
    this.xactions.push(summaryBuf);
  } else if (strategy === 'copyPrealloc') {
    var summaryBuf = this.buf.slice(this.bufCursor, this.bufCursor + 10);
    data.copy(summaryBuf, 0, 10);
    this.bufCursor += 10;
    this.xactions.push(summaryBuf);
  } else if (strategy === 'copyPreallocNoSlice') {
    data.copy(this.buf, this.bufCursor, 0, this.bufCursor + 10);
    this.bufCursor += 10;
  }
};
XactionSummary.prototype.dump = function () {
  // Dump xactions to a JSON file for post-processing
};
XactionSummary.prototype.log = function () {
  var totalLength = 0;
  var count = 0;
  if (strategy !== 'copyPreallocNoSlice') {
    for (var i = 0; i < this.xactions.length; i++) {
      count++;
      totalLength += this.xactions[i].length;
    }
  } else {
    totalLength = this.bufCursor;
    count = totalLength / 10;
  }
  console.log('%d buffers, total %d bytes (avg: %d)',
              count, totalLength, totalLength / count);
  gc();
}
var xactionSummaries = new XactionSummary();


// Below this, drivers for the demo
var makeNewReq = (function() {
  var bigBuffer = new Buffer(requestSize);
  bigBuffer.fill('x');
  var reqCount = 0;

  return function () {
    var newReq = Buffer(requestSize);
    bigBuffer.copy(newReq);
    newReq.fill('x');
    newReq.writeUInt32BE(reqCount, 0);
    reqCount++;
    return newReq;
  };
})();

// Run this with --expose_gc.  But if you don't, don't crash.
if (!global.gc) {
   global.gc = function () { console.log('Cannot force gc'); };
}

function go() {
  var requestsProcessed = 0;
  function newReqIfNeeded(err) {
    if (err) throw err; // Blow up if there's an error.
    if (requestsProcessed === requestsToProcess) {
      // We're done.
      xactionSummaries.log();
      return;
    }
    ++requestsProcessed;
    setImmediate(function () {
      var req = makeNewReq();
      handleReqData(req, newReqIfNeeded);
    });
  }
  newReqIfNeeded();
}
go();
