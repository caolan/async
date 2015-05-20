module.exports = [
  {
    name: "each(10)",
    fn: function (async, deferred) {
      async.each(Array(10), function (num, cb) {
        async.setImmediate(cb);
      }, done(deferred));
    }
  },
  {
    name: "each(10000)",
    fn: function (async, deferred) {
      async.each(Array(10000), function (num, cb) {
        async.setImmediate(cb);
      }, done(deferred));
    }
  },
  {
    name: "eachSeries(10)",
    fn: function (async, deferred) {
      async.eachSeries(Array(10), function (num, cb) {
        async.setImmediate(cb);
      }, done(deferred));
    }
  },
  {
    name: "eachSeries(10000)",
    fn: function (async, deferred) {
      async.eachSeries(Array(10000), function (num, cb) {
        async.setImmediate(cb);
      }, done(deferred));
    }
  }
];

function done(deferred) {
  return function () {
    deferred.resolve();
  };
}
