var runs = parseInt(process.env.RUNS) || 1e8;
var addPropEvery = Math.floor(runs / 500);


function avgXYZ(a) {
  return (a.x + a.y + a.z) / 3;
}

function constantShape() {
  var a = { x: 42, y: 13, z: 2 };
  var b = { foo: 'bar' };
  var sum = 0;
  var start = process.hrtime();
  for (var i = 0; i < runs; i++) {
    sum += avgXYZ(a);
    if (i % addPropEvery == 0) {
      b[i] = 21;
    }
  }
  var end = process.hrtime(start);
  console.log('Constant: %d, sum: %d', end[0] * 1e9 + end[1], sum);
  console.log('Properties on b: %d', Object.keys(b).length);
}

function growingShape() {
  var a = { x: 42, y: 13, z: 2 };
  var b = { foo: 'bar' };
  var sum = 0;
  var start = process.hrtime();
  for (var i = 0; i < runs; i++) {
    sum += avgXYZ(a);
    if (i % addPropEvery == 0) {
      a[i] = 21;
    }
  }
  var end = process.hrtime(start);
  console.log('Growing : %d, sum: %d', end[0] * 1e9 + end[1], sum);
  console.log('Properties on a: %d', Object.keys(a).length);
}

constantShape();
growingShape();
