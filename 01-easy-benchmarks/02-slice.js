var b = require('../benchmark');

function slice() {
  return [].slice.call(arguments);
}

function makeArray() {
  var args = new Array(arguments.length);
  for (var i = 0; i < args.length; ++i) {
    args[i] = arguments[i];
  }
  return args;
}

b.runBaseline(slice);
b.run(makeArray);
