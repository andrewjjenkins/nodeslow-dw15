var Benchmark = require('benchmark');
var monopoly = new Benchmark.Suite;
var samples = parseInt(process.env.SAMPLES) || 100;

function doTheAdd(a, b) {
  return a + b;
}

monopoly.add('monomorphic', function monomorphicAdd() {
  doTheAdd(1, 2);
  doTheAdd(3, 4);
}, { minSamples : samples });

monopoly.add('polymorphic', function polymorphicAdd() {
  doTheAdd(1, 2);
  doTheAdd('a', 'b');
}, { minSamples : samples });

monopoly.add('nonemorphic', function nonemorphicAdd() {
  3;
  'ab';
}, { minSamples: samples });

monopoly.on('cycle', function (event) {
  console.log(String(event.target));
});

monopoly.run();
