var _ = require("lodash");
var tasks;

module.exports = [
  {
    name: "each",
    // args lists are passed to the setup function
    args: [[10], [300], [10000]],
    setup: function(count) {
      tasks = _.range(count);
    },
    fn: function (async, done) {
      async.each(tasks, function (num, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "eachSeries",
    args: [[10], [300], [10000]],
    setup: function(count) {
      tasks = _.range(count);
    },
    fn: function (async, done) {
      async.eachSeries(tasks, function (num, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "eachLimit",
    args: [[10], [300], [10000]],
    setup: function(count) {
      tasks = _.range(count);
    },
    fn: function (async, done) {
      async.eachLimit(tasks, 4, function (num, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "map",
    // args lists are passed to the setup function
    args: [[10], [300], [10000]],
    setup: function(count) {
      tasks = _.range(count);
    },
    fn: function (async, done) {
      async.map(tasks, function (num, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "mapSeries",
    args: [[10], [300], [10000]],
    setup: function(count) {
      tasks = _.range(count);
    },
    fn: function (async, done) {
      async.mapSeries(tasks, function (num, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "mapLimit",
    args: [[10], [300], [10000]],
    setup: function(count) {
      tasks = _.range(count);
    },
    fn: function (async, done) {
      async.mapLimit(tasks, 4, function (num, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "eachOf",
    // args lists are passed to the setup function
    args: [[10], [300], [10000]],
    setup: function(count) {
      tasks = _.range(count);
    },
    fn: function (async, done) {
      async.eachOf(tasks, function (num, i, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "eachOfSeries",
    args: [[10], [300], [10000]],
    setup: function(count) {
      tasks = _.range(count);
    },
    fn: function (async, done) {
      async.eachOfSeries(tasks, function (num, i, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "eachOfLimit",
    args: [[10], [300], [10000]],
    setup: function(count) {
      tasks = _.range(count);
    },
    fn: function (async, done) {
      async.eachOfLimit(tasks, 4, function (num, i, cb) {
        async.setImmediate(cb);
      }, done);
    }
  },
  {
    name: "parallel",
    args: [[10], [100], [1000]],
    setup: function (count) {
      tasks = _.range(count).map(function () {
        return function (cb) {
          setImmediate(cb);
        };
      });
    },
    fn: function (async, done) {
      async.parallel(tasks, done);
    }
  },
  {
    name: "series",
    args: [[10], [100], [1000]],
    setup: function (count) {
      tasks = _.range(count).map(function () {
        return function (cb) { setImmediate(cb); };
      });
    },
    fn: function (async, done) {
      async.series(tasks, done);
    }
  },
  {
    name: "waterfall",
    args: [[10], [100], [1000]],
    setup: function (count) {
      tasks = [
          function (cb) {
            return cb(null, 1);
          }
        ].concat(_.range(count).map(function (i) {
          return function (arg, cb) {
            setImmediate(function () {
              cb(null, i);
            });
          };
        }));
    },
    fn: function (async, done) {
      async.waterfall(tasks, done);
    }
  },
  {
    name: "queue",
    args: [[1000], [30000], [100000], [200000]],
    setup: function (count) {
      tasks = count;
    },
    fn: function (async, done) {
      var numEntries = tasks;
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
    name: "defer nextTick",
    fn: function (async, done) {
      process.nextTick(done);
    }
  },
  {
    name: "defer setImmediate",
    fn: function (async, done) {
      setImmediate(done);
    }
  },
  {
    name: "defer async.nextTick",
    fn: function (async, done) {
      async.nextTick(done);
    }
  },
  {
    name: "defer async.setImmediate",
    fn: function (async, done) {
      async.setImmediate(done);
    }
  },
  {
    name: "defer setTimeout",
    fn: function (async, done) {
      setTimeout(done, 0);
    }
  },
  {
    name: "ensureAsync sync",
    fn: function (async, done) {
      async.ensureAsync(function (cb) {
        cb();
      })(done);
    }
  },
  {
    name: "ensureAsync async",
    fn: function (async, done) {
      async.ensureAsync(function (cb) {
        setImmediate(cb);
      })(done);
    }
  },
  {
    name: "ensureAsync async noWrap",
    fn: function (async, done) {
      (function (cb) {
        setImmediate(cb);
      }(done));
    }
  }
];

