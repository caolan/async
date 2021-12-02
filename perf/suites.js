var _ = require("lodash");
var tasks;
var count;

module.exports = [{
    name: "each",
    // args lists are passed to the setup function
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.each(tasks, (num, cb) => {
            async.setImmediate(cb);
        }, done);
    }
}, {
    name: "eachSeries",
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.eachSeries(tasks, (num, cb) => {
            async.setImmediate(cb);
        }, done);
    }
}, {
    name: "eachLimit",
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.eachLimit(tasks, 4, (num, cb) => {
            async.setImmediate(cb);
        }, done);
    }
}, {
    name: "map",
    // args lists are passed to the setup function
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.map(tasks, (num, cb) => {
            async.setImmediate(cb);
        }, done);
    }
}, {
    name: "mapSeries",
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.mapSeries(tasks, (num, cb) => {
            async.setImmediate(cb);
        }, done);
    }
}, {
    name: "mapLimit",
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.mapLimit(tasks, 4, (num, cb) => {
            async.setImmediate(cb);
        }, done);
    }
}, {
    name: "filter",
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(c) {
        count = c;
        tasks = _.range(count);
    },
    fn(async, done) {
        async.filter(tasks, (num, cb) => {
            async.setImmediate(() => {
                cb(null, num > (count / 2));
            });
        }, done);
    }
}, {
    name: "filterLimit",
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(c) {
        count = c;
        tasks = _.range(count);
    },
    fn(async, done) {
        async.filterLimit(tasks, 10, (num, cb) => {
            async.setImmediate(() => {
                cb(null, num > (count / 2));
            });
        }, done);
    }
}, {
    name: "concat",
    // args lists are passed to the setup function
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.concat(tasks, (num, cb) => {
            async.setImmediate(() => {
                cb(null, [num]);
            });
        }, done);
    }
}, {
    name: "eachOf",
    // args lists are passed to the setup function
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.eachOf(tasks, (num, i, cb) => {
            async.setImmediate(cb);
        }, done);
    }
}, {
    name: "eachOfSeries",
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.eachOfSeries(tasks, (num, i, cb) => {
            async.setImmediate(cb);
        }, done);
    }
}, {
    name: "eachOfLimit",
    args: [
        [10],
        [300],
        [10000]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.eachOfLimit(tasks, 4, (num, i, cb) => {
            async.setImmediate(cb);
        }, done);
    }
}, {
    name: "parallel",
    args: [
        [10],
        [100],
        [1000]
    ],
    setup(num) {
        tasks = _.range(num).map(() => {
            return function(cb) {
                setImmediate(cb);
            };
        });
    },
    fn(async, done) {
        async.parallel(tasks, done);
    }
}, {
    name: "series",
    args: [
        [10],
        [100],
        [1000]
    ],
    setup(num) {
        tasks = _.range(num).map(() => {
            return function(cb) {
                setImmediate(cb);
            };
        });
    },
    fn(async, done) {
        async.series(tasks, done);
    }
}, {
    name: "waterfall",
    args: [
        [10],
        [100],
        [1000]
    ],
    setup(num) {
        tasks = [
            function(cb) {
                return cb(null, 1);
            }
        ].concat(_.range(num).map((i) => {
            return function(arg, cb) {
                setImmediate(() => {
                    cb(null, i);
                });
            };
        }));
    },
    fn(async, done) {
        async.waterfall(tasks, done);
    }
}, {
    name: "auto",
    args: [
        [5],
        [10],
        [100]
    ],
    setup(num) {
        tasks = {
            dep1 (cb) { cb(null, 1); }
        };
        _.times(num, (n) => {
            var task = ['dep' + (n+1), function(results, cb) {
                setImmediate(cb, null, n);
            }];
            if (n > 2) task.unshift('dep' + n);
            tasks['dep' + (n+2)] = task;
        });
    },
    fn(async, done) {
        async.auto(tasks, done);
    }
}, {
    name: "queue",
    args: [
        [10],
        [100],
        [1000],
        [30000],
        [100000],
        [200000]
    ],
    setup(num) {
        tasks = num;
    },
    fn(async, done) {
        var numEntries = tasks;
        var q = async.queue(worker, 1);
        for (var i = 1; i <= numEntries; i++) {
            q.push({
                num: i
            });
        }

        function worker(task, callback) {
            if (task.num === numEntries) {
                return done();
            }
            setImmediate(callback);
        }
    }
}, {
    name: "priorityQueue",
    args: [
        [10],
        [100],
        [1000],
        [30000],
        [50000]
    ],
    setup(num) {
        tasks = num;
    },
    fn(async, done) {
        var numEntries = tasks;
        var q = async.priorityQueue(worker, 1);
        for (var i = 1; i <= numEntries; i++) {
            q.push({
                num: i
            }, i);
        }

        var completedCnt = 0;

        function worker(task, callback) {
            completedCnt++;
            if (completedCnt === numEntries) {
                return done();
            }
            setImmediate(callback);
        }
    }
}, {
    name: "some - no short circuit- false",
    // args lists are passed to the setup function
    args: [
        [500]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.some(tasks, (i, cb) => {
            async.setImmediate(() => {
                cb(i >= 600);
            });
        }, done);
    }
}, {
    name: "some - short circuit - true",
    // args lists are passed to the setup function
    args: [
        [500]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.some(tasks, (i, cb) => {
            async.setImmediate(() => {
                cb(i >= 60);
            });
        }, done);
    }
}, {
    name: "every - no short circuit- true",
    // args lists are passed to the setup function
    args: [
        [500]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.every(tasks, (i, cb) => {
            async.setImmediate(() => {
                cb(i <= 600);
            });
        }, done);
    }
}, {
    name: "every - short circuit - false",
    // args lists are passed to the setup function
    args: [
        [500]
    ],
    setup(num) {
        tasks = _.range(num);
    },
    fn(async, done) {
        async.every(tasks, (i, cb) => {
            async.setImmediate(() => {
                cb(i <= 60);
            });
        }, done);
    }
}, {
    name: "defer nextTick",
    fn(async, done) {
        process.nextTick(done);
    }
}, {
    name: "defer setImmediate",
    fn(async, done) {
        setImmediate(done);
    }
}, {
    name: "defer async.nextTick",
    fn(async, done) {
        async.nextTick(done);
    }
}, {
    name: "defer async.setImmediate",
    fn(async, done) {
        async.setImmediate(done);
    }
}, {
    name: "defer setTimeout",
    fn(async, done) {
        setTimeout(done, 0);
    }
}, {
    name: "ensureAsync sync",
    fn(async, done) {
        async.ensureAsync((cb) => {
            cb();
        })(done);
    }
}, {
    name: "ensureAsync async",
    fn(async, done) {
        async.ensureAsync((cb) => {
            setImmediate(cb);
        })(done);
    }
}, {
    name: "ensureAsync async noWrap",
    fn(async, done) {
        (function(cb) {
            setImmediate(cb);
        }(done));
    }
}];
