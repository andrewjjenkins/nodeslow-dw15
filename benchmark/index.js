'use strict';
var colors = require('colors/safe');

var RUNCOUNT = parseInt(process.env.RUNCOUNT) || 1e6;

function hrtimeLT(a, b) {
  return ((a[0] < b[0]) || ((a[0] === b[0]) && (a[1] < b[1])));
}

function hrtimeSpeedup(a, b) {
  var aDbl = a[0] * 1e9 + a[1];
  var bDbl = b[0] * 1e9 + b[1];
  return aDbl/bDbl;
}

var baseline = 0;
function run(f) {
  var start = process.hrtime();
  for(var i = 0; i < RUNCOUNT; ++i) {
    f('a', 'b', 345, 7.865);
  }
  var diff = process.hrtime(start);
  var colorizer = colors.bold;
  var speedup = 1;
  if (baseline) {
    colorizer = hrtimeLT(diff, baseline) ? colors.green : colors.red;
    speedup = hrtimeSpeedup(baseline, diff);
  }
  console.log(colorizer('%s took %d milliseconds for %d iterations (%s x)'),
              f.name, diff[0] * 1e3 + diff[1]/1e6, RUNCOUNT,
              speedup.toPrecision(2));
  return diff;
}
function runBaseline(f) {
  baseline = run(f);
}
function clearBaseline() {
  baseline = 0;
}

module.exports.colors = colors;
module.exports.RUNCOUNT = RUNCOUNT;
module.exports.run = run;
module.exports.runBaseline = runBaseline;
module.exports.hrtimeLT = hrtimeLT;
