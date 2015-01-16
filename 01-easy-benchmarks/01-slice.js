var b = require('../benchmark');

function slice() {
  return [].slice.call(arguments);
}

b.run(slice);
