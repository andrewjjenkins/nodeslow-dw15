var colors = require('colors/safe');

var RUNCOUNT = parseInt(process.env.RUNCOUNT) || 1e6;

function runtest(f) {
  var start = process.hrtime();
  for(var i = 0; i < RUNCOUNT; ++i) {
    f('a', 'b', 345, 7.865);
  }
  var diff = process.hrtime(start);
  console.log(colors.green('%s took %d milliseconds for %d iterations'),
              f.name, diff[0] * 1e3 + diff[1]/1e6, RUNCOUNT);
}

function slice() {
  return [].slice.call(arguments);
}

runtest(slice);

console.log(process.versions);
