'use strict';
var http = require('http');
var async = require('async');

var sleepUnit = parseInt(process.env.SLEEP) || 500;

function handleNewConnectionPyramid(userA, userB, cb) {
  notifyPhoneNewConnection(userB, userA.name, function (err) {
    if (err) return cb(err);
    addToBuddyList(userB, userA.name, function(err) {
      if (err) return cb(err);
      emailNewConnection(userB, userA.name, function (err) {
        if (err) return cb(err);
        emailNewConnection(userA, userB.name, function (err) {
          findOneHopNeighbors(userA.name, userB.name, function (err, neighbors) {
            if (err) return cb(err);
            function emailNextNeighbor(i) {
              if (i < neighbors.length) {
                emailCommonNeighbor(neighbors[i], userA.name, userB.name,
                function (err) {
                  if (err) return cb(err);
                  emailNextNeighbor(i + 1);
                });
              } else {
                findTwoHopNeighbors(userA.name, userB.name,
                  function (err, neighbors) {
                    if (err) return cb(err);
                    function emailNextTwoHopNeighbor(i) {
                      if (i < neighbors.length) {
                        emailCommonNeighbor(neighbors[i], userA.name,
                          userB.name, function (err) {
                          if (err) return cb(err);
                          emailNextTwoHopNeighbor(i + 1);
                        });
                      } else {
                        // Done!
                        cb();
                      }
                    }
                    emailNextTwoHopNeighbor(0);
                  }
                );
              }
            }
            emailNextNeighbor(0);
          });
        });
      });
    });
  });
}

function handleNewConnectionAsyncSeries(userA, userB, cb) {
  async.series([
    notifyPhoneNewConnection.bind(this, userB, userA.name),
    addToBuddyList.bind(this, userB, userA.name),
    emailNewConnection.bind(this, userB, userA.name),
    emailNewConnection.bind(this, userA, userB.name),
    findAndEmailOneHopNeighbors,
    findAndEmailTwoHopNeighbors,
  ], cb);

  function findAndEmailOneHopNeighbors(cb) {
    async.waterfall([
      findOneHopNeighbors.bind(this, userA.name, userB.name),
      emailCommonNeighbors,
    ], cb);
  }
  function emailCommonNeighbors(neighbors, cb) {
    var emailers = [];
    for (var i = 0; i < neighbors.length; i++) {
      emailers.push(emailCommonNeighbor.bind(this, neighbors[i],
                                             userA.name, userB.name));
    }
    async.series(emailers, cb);
  }
  function findAndEmailTwoHopNeighbors(cb) {
    async.waterfall([
      findTwoHopNeighbors.bind(this, userA.name, userB.name),
      emailCommonNeighbors,
    ], cb);
  }
}

function handleNewConnectionAsyncParallel(userA, userB, cb) {
  async.parallel([
    notifyPhoneNewConnection.bind(this, userB, userA.name),
    addToBuddyList.bind(this, userB, userA.name),
    emailNewConnection.bind(this, userB, userA.name),
    emailNewConnection.bind(this, userA, userB.name),
    findAndEmailOneHopNeighbors,
    findAndEmailTwoHopNeighbors,
  ], cb);

  function findAndEmailOneHopNeighbors(cb) {
    async.waterfall([
      findOneHopNeighbors.bind(this, userA.name, userB.name),
      emailCommonNeighbors,
    ], cb);
  }
  function emailCommonNeighbors(neighbors, cb) {
    var emailers = [];
    for (var i = 0; i < neighbors.length; i++) {
      emailers.push(emailCommonNeighbor.bind(this, neighbors[i],
                                             userA.name, userB.name));
    }
    async.parallel(emailers, cb);
  }
  function findAndEmailTwoHopNeighbors(cb) {
    async.waterfall([
      findTwoHopNeighbors.bind(this, userA.name, userB.name),
      emailCommonNeighbors,
    ], cb);
  }
}

var handleNewConnection = handleNewConnectionPyramid;
if (process.env.STRATEGY === "series") {
  handleNewConnection = handleNewConnectionAsyncSeries;
} else if (process.env.STRATEGY === "parallel") {
  handleNewConnection = handleNewConnectionAsyncParallel;
} else if (process.env.STRATEGY) {
  throw new Error('Unknown strategy ' + process.env.STRATEGY + ' requested');
}

function go() {
  var alice = { name: 'Alice' };
  var bob = { name: 'Bob' };

  var start = new Date();
  console.log(start + ' Processing new connection between Alice and Bob');
  handleNewConnection(alice, bob, function (err) {
    var end = new Date();
    if (err) throw err;
    console.log(end + ' Done processing new connection between Alice and Bob');
    console.log('Took %d ms', end.getTime() - start.getTime());
  });
}
go();

// Mockups of the operations: they just sleep for a while and then call
// their callback.

function date() {
  return (new Date()).toISOString();
}

function notifyPhoneNewConnection(phoneUser, newUserName, cb) {
  console.log(date() + ' starting notifyPhoneNewConnection(%s, %s)',
              phoneUser.name, newUserName);
  setTimeout(function () {
    console.log(date() + ' finishing notifyPhoneNewConnection(%s, %s)',
                phoneUser.name, newUserName);
    cb();
  }, 1.25 * sleepUnit);
}

function addToBuddyList(chatUser, newUserName, cb) {
  console.log(date() + ' starting addBuddyList(%s, %s)',
              chatUser.name, newUserName);
  setTimeout(function () {
    console.log(date() + ' finishing addBuddyList(%s, %s)',
                chatUser.name, newUserName);
    cb();
  }, sleepUnit);
}

function emailNewConnection(user, newUserName, cb) {
  console.log(date() + ' starting emailNewConnection(%s, %s)',
              user.name, newUserName);
  setTimeout(function () {
    console.log(date() + ' finishing emailNewConnection(%s, %s)',
                user.name, newUserName);
    cb();
  }, sleepUnit);
}

var oneHopNeighbors = [ 'Chris', 'Deidre', 'Emmett', 'Fran', 'George' ];
function findOneHopNeighbors(userA, userB, cb) {
  console.log(date() + ' starting findOneHopNeighbors(%s, %s)', userA, userB);
  setTimeout(function () {
    console.log(date() + ' finishing findOneHopNeighbors(%s, %s)',
                userA, userB);
    cb(null, oneHopNeighbors);
  }, 0.75 * sleepUnit);
}

function emailCommonNeighbor(userAName, userBName, neighbor, cb) {
  console.log(date() + ' starting emailCommonNeighbor(%s, %s, %s)',
              userAName, userBName, neighbor);
  setTimeout(function () {
    console.log(date() + ' finishing emailCommonNeighbor(%s, %s, %s)',
                userAName, userBName, neighbor);
    cb();
  }, 0.25 * sleepUnit);
}

var twoHopNeighbors = [ 'Henrietta', 'Igor', 'James', 'Kelly', 'Lars',
                        'Minnie', 'Nick', 'Ophelia', 'Paul', 'Rick',
                        'Samantha', 'Tim' ];
function findTwoHopNeighbors(userA, userB, cb) {
  console.log(date() + ' starting findTwoHopNeighbors(%s, %s)', userA, userB);
  setTimeout(function () {
    console.log(date() + ' finishing findTwoHopNeighbors(%s, %s)',
                userA, userB);
    cb(null, twoHopNeighbors);
  }, 0.9 * sleepUnit);
}
