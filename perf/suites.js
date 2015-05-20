var _ = require("lodash");
var parallel1000Funcs = _.range(1000).map(function () {
  return function (cb) { cb(); };
});
var parallel10Funcs = _.range(10).map(function () {
  return function (cb) { cb(); };
});

module.exports = [
  {
    name: "each(10)",
    fn: function (async, done) {
      async.each(Array(10), function (num, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "each(10000)",
    fn: function (async, done) {
      async.each(Array(10000), function (num, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "eachSeries(10)",
    fn: function (async, done) {
      async.eachSeries(Array(10), function (num, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "eachSeries(10000)",
    fn: function (async, done) {
      async.eachSeries(Array(10000), function (num, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "parallel(10)",
    fn: function (async, done) {
      async.parallel(parallel10Funcs, done);
    }
  },
  {
    name: "parallel(1000)",
    fn: function (async, done) {
      async.parallel(parallel1000Funcs, done);
    }
  },
  {
    name: "queue(1000)",
    fn: function (async, done) {
      var numEntries = 1000;
      var q = async.queue(worker, 1);
      for (var i = 1; i <= numEntries; i++) {
        q.push({num: i});
      }
      function worker(task, callback) {
        if (task.num === numEntries) {
          return done();
        }
        setImmediate(callback);
      }
    }
  },
  {
    name: "queue(30000)",
    fn: function (async, done) {
      var numEntries = 30000;
      var q = async.queue(worker, 1);
      for (var i = 1; i <= numEntries; i++) {
        q.push({num: i});
      }
      function worker(task, callback) {
        if (task.num === numEntries) {
          return done();
        }
        setImmediate(callback);
      }
    }
  },
  {
    name: "queue(100000)",
    fn: function (async, done) {
      var numEntries = 100000;
      var q = async.queue(worker, 1);
      for (var i = 1; i <= numEntries; i++) {
        q.push({num: i});
      }
      function worker(task, callback) {
        if (task.num === numEntries) {
          return done();
        }
        setImmediate(callback);
      }
    }
  },
  {
    name: "queue(200000)",
    fn: function (async, done) {
      var numEntries = 200000;
      var q = async.queue(worker, 1);
      for (var i = 1; i <= numEntries; i++) {
        q.push({num: i});
      }
      function worker(task, callback) {
        if (task.num === numEntries) {
          return done();
        }
        setImmediate(callback);
      }
    }
  }
];

