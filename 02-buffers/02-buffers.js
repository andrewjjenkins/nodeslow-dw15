'use strict';

var maxBuffers = parseInt(process.env.BUFFERS) || 1e6;
var copy = process.env.COPY;
var slices = [];

for (var i = 0; i < maxBuffers; ++i) {
  var buf = new Buffer(10000);
  if (copy) {
    var copyBuf = new Buffer(10);
    buf.copy(copyBuf, 0, 10);
    slices.push(copyBuf);
  } else {
    slices.push(buf.slice(0, 10));
  }
}

console.log('There are %d slices stored', slices.length);
