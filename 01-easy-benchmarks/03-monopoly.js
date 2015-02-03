var Benchmark = require('benchmark');
var monopoly = new Benchmark.Suite;
var samples = parseInt(process.env.SAMPLES) || 100;

function add(a, b) {
  return a + b;
}

monopoly.add('monomorphic', function monomorphicAdd() {
  add(1, 2);
  add(3, 4);
}, { minSamples : samples });

monopoly.add('polymorphic', function polymorphicAdd() {
  add(1, 2);
  add('a', 'b');
}, { minSamples : samples });

monopoly.add('nonemorphic', function nonemorphicAdd() {
  3;
}, { minSamples: samples });

monopoly.on('cycle', function (event) {
  console.log(String(event.target));
});

monopoly.run();
