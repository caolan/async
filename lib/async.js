/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */

var noop = require('./util/noop');
var identity = require('./util/identity');
var toBool = require('./util/tobool');
var notId = require('./util/notid');
var ensureAsync = require('./util/ensureasync');
var only_once = require('./util/onlyonce');
var _once = require('./util/once');
var _isArray = require('./util/isarray');
var _isArrayLike = require('./util/isarraylike');
var _arrayEach = require('./util/arrayeach');
var _map = require('./util/map');
var _range = require('./util/range');
var _reduce = require('./util/reduce');
var _forEachOf = require('./util/foreachof');
var _indexOf = require('./util/indexof');
var _keys = require('./util/keys');
var _keyIterator = require('./util/keyiterator');
var _restParam = require('./util/restparam');
var _withoutIndex = require('./util/withoutindex');
var _createTester = require('./util/createtester');
var _filter = require('./util/filter');
var _reject = require('./util/reject');
var _findGetResult = require('./util/findgetresult');
var _parallel = require('./util/parallel');
var _console_fn = require('./util/consolefn');
var _times = require('./util/times');
var _applyEach = require('./util/applyeach');
var _asyncify = require('./util/asyncify');
var _nextTick = require('./util/nexttick');
var _setImmediate = require('./util/setimmediate');

var async = {};

// global on the server, window in the browser
var previous_async;

// Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.
var root = typeof self === 'object' && self.self === self && self ||
           typeof global === 'object' && global.global === global && global ||
           this;

if (root != null) previous_async = root.async;

async.noConflict = function () {
    root.async = previous_async;
    return async;
};

async.nextTick = _nextTick;
async.setImmediate = _setImmediate;

async.forEach =
async.each = function (arr, iterator, callback) {
    return async.eachOf(arr, _withoutIndex(iterator), callback);
};

async.forEachSeries =
async.eachSeries = function (arr, iterator, callback) {
    return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
};


async.forEachLimit =
async.eachLimit = function (arr, limit, iterator, callback) {
    return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
};

async.forEachOf =
async.eachOf = function (object, iterator, callback) {
    callback = _once(callback || noop);
    object = object || [];

    var iter = _keyIterator(object);
    var key, completed = 0;

    while ((key = iter()) != null) {
        completed += 1;
        iterator(object[key], key, only_once(done));
    }

    if (completed === 0) callback(null);

    function done(err) {
        completed--;
        if (err) {
            callback(err);
        }
        // Check key is null in case iterator isn't exhausted
        // and done resolved synchronously.
        else if (key === null && completed <= 0) {
            callback(null);
        }
    }
};

async.forEachOfSeries =
async.eachOfSeries = function (obj, iterator, callback) {
    callback = _once(callback || noop);
    obj = obj || [];
    var nextKey = _keyIterator(obj);
    var key = nextKey();
    function iterate() {
        var sync = true;
        if (key === null) {
            return callback(null);
        }
        iterator(obj[key], key, only_once(function (err) {
            if (err) {
                callback(err);
            }
            else {
                key = nextKey();
                if (key === null) {
                    return callback(null);
                } else {
                    if (sync) {
                        async.setImmediate(iterate);
                    } else {
                        iterate();
                    }
                }
            }
        }));
        sync = false;
    }
    iterate();
};

async.forEachOfLimit =
async.eachOfLimit = function (obj, limit, iterator, callback) {
    _eachOfLimit(limit)(obj, iterator, callback);
};

function _eachOfLimit(limit) {

    return function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        if (limit <= 0) {
            return callback(null);
        }
        var done = false;
        var running = 0;
        var errored = false;

        (function replenish () {
            if (done && running <= 0) {
                return callback(null);
            }

            while (running < limit && !errored) {
                var key = nextKey();
                if (key === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iterator(obj[key], key, only_once(function (err) {
                    running -= 1;
                    if (err) {
                        callback(err);
                        errored = true;
                    }
                    else {
                        replenish();
                    }
                }));
            }
        })();
    };
}


function doParallel(fn) {
    return function (obj, iterator, callback) {
        return fn(async.eachOf, obj, iterator, callback);
    };
}
function doParallelLimit(fn) {
    return function (obj, limit, iterator, callback) {
        return fn(_eachOfLimit(limit), obj, iterator, callback);
    };
}
function doSeries(fn) {
    return function (obj, iterator, callback) {
        return fn(async.eachOfSeries, obj, iterator, callback);
    };
}

function _asyncMap(eachfn, arr, iterator, callback) {
    callback = _once(callback || noop);
    arr = arr || [];
    var results = _isArrayLike(arr) ? [] : {};
    eachfn(arr, function (value, index, callback) {
        iterator(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

async.map = doParallel(_asyncMap);
async.mapSeries = doSeries(_asyncMap);
async.mapLimit = doParallelLimit(_asyncMap);

// reduce only has a series version, as doing reduce in parallel won't
// work in many situations.
async.inject =
async.foldl =
async.reduce = function (arr, memo, iterator, callback) {
    async.eachOfSeries(arr, function (x, i, callback) {
        iterator(memo, x, function (err, v) {
            memo = v;
            callback(err);
        });
    }, function (err) {
        callback(err, memo);
    });
};

async.foldr =
async.reduceRight = function (arr, memo, iterator, callback) {
    var reversed = _map(arr, identity).reverse();
    async.reduce(reversed, memo, iterator, callback);
};

async.transform = function (arr, memo, iterator, callback) {
    if (arguments.length === 3) {
        callback = iterator;
        iterator = memo;
        memo = _isArray(arr) ? [] : {};
    }

    async.eachOf(arr, function(v, k, cb) {
        iterator(memo, v, k, cb);
    }, function(err) {
        callback(err, memo);
    });
};

async.select =
async.filter = doParallel(_filter);

async.selectLimit =
async.filterLimit = doParallelLimit(_filter);

async.selectSeries =
async.filterSeries = doSeries(_filter);

async.reject = doParallel(_reject);
async.rejectLimit = doParallelLimit(_reject);
async.rejectSeries = doSeries(_reject);

async.any =
async.some = _createTester(async.eachOf, toBool, identity);

async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

async.all =
async.every = _createTester(async.eachOf, notId, notId);

async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

async.detect = _createTester(async.eachOf, identity, _findGetResult);
async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

async.sortBy = function (arr, iterator, callback) {
    async.map(arr, function (x, callback) {
        iterator(x, function (err, criteria) {
            if (err) {
                callback(err);
            }
            else {
                callback(null, {value: x, criteria: criteria});
            }
        });
    }, function (err, results) {
        if (err) {
            return callback(err);
        }
        else {
            callback(null, _map(results.sort(comparator), function (x) {
                return x.value;
            }));
        }

    });

    function comparator(left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }
};

async.auto = function (tasks, concurrency, callback) {
    if (typeof arguments[1] === 'function') {
        // concurrency is optional, shift the args.
        callback = concurrency;
        concurrency = null;
    }
    callback = _once(callback || noop);
    var keys = _keys(tasks);
    var remainingTasks = keys.length;
    if (!remainingTasks) {
        return callback(null);
    }
    if (!concurrency) {
        concurrency = remainingTasks;
    }

    var results = {};
    var runningTasks = 0;

    var listeners = [];
    function addListener(fn) {
        listeners.unshift(fn);
    }
    function removeListener(fn) {
        var idx = _indexOf(listeners, fn);
        if (idx >= 0) listeners.splice(idx, 1);
    }
    function taskComplete() {
        remainingTasks--;
        _arrayEach(listeners.slice(0), function (fn) {
            fn();
        });
    }

    addListener(function () {
        if (!remainingTasks) {
            callback(null, results);
        }
    });

    _arrayEach(keys, function (k) {
        var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
        var taskCallback = _restParam(function(err, args) {
            runningTasks--;
            if (args.length <= 1) {
                args = args[0];
            }
            if (err) {
                var safeResults = {};
                _forEachOf(results, function(val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[k] = args;
                callback(err, safeResults);
            }
            else {
                results[k] = args;
                async.setImmediate(taskComplete);
            }
        });
        var requires = task.slice(0, task.length - 1);
        // prevent dead-locks
        var len = requires.length;
        var dep;
        while (len--) {
            if (!(dep = tasks[requires[len]])) {
                throw new Error('Has inexistant dependency');
            }
            if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                throw new Error('Has cyclic dependencies');
            }
        }
        function ready() {
            return runningTasks < concurrency && _reduce(requires, function (a, x) {
                return (a && results.hasOwnProperty(x));
            }, true) && !results.hasOwnProperty(k);
        }
        if (ready()) {
            runningTasks++;
            task[task.length - 1](taskCallback, results);
        }
        else {
            addListener(listener);
        }
        function listener() {
            if (ready()) {
                runningTasks++;
                removeListener(listener);
                task[task.length - 1](taskCallback, results);
            }
        }
    });
};

async.retry = function(times, task, callback) {
    var DEFAULT_TIMES = 5;
    var DEFAULT_INTERVAL = 0;

    var attempts = [];

    var opts = {
        times: DEFAULT_TIMES,
        interval: DEFAULT_INTERVAL
    };

    function parseTimes(acc, t){
        if(typeof t === 'number'){
            acc.times = parseInt(t, 10) || DEFAULT_TIMES;
        } else if(typeof t === 'object'){
            acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
            acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
        } else {
            throw new Error('Unsupported argument type for \'times\': ' + typeof t);
        }
    }

    var length = arguments.length;
    if (length < 1 || length > 3) {
        throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
    } else if (length <= 2 && typeof times === 'function') {
        callback = task;
        task = times;
    }
    if (typeof times !== 'function') {
        parseTimes(opts, times);
    }
    opts.callback = callback;
    opts.task = task;

    function wrappedTask(wrappedCallback, wrappedResults) {
        function retryAttempt(task, finalAttempt) {
            return function(seriesCallback) {
                task(function(err, result){
                    seriesCallback(!err || finalAttempt, {err: err, result: result});
                }, wrappedResults);
            };
        }

        function retryInterval(interval){
            return function(seriesCallback){
                setTimeout(function(){
                    seriesCallback(null);
                }, interval);
            };
        }

        while (opts.times) {

            var finalAttempt = !(opts.times-=1);
            attempts.push(retryAttempt(opts.task, finalAttempt));
            if(!finalAttempt && opts.interval > 0){
                attempts.push(retryInterval(opts.interval));
            }
        }

        async.series(attempts, function(done, data){
            data = data[data.length - 1];
            (wrappedCallback || opts.callback)(data.err, data.result);
        });
    }

    // If a callback is passed, run this as a controll flow
    return opts.callback ? wrappedTask() : wrappedTask;
};

async.waterfall = function (tasks, callback) {
    callback = _once(callback || noop);
    if (!_isArray(tasks)) {
        var err = new Error('First argument to waterfall must be an array of functions');
        return callback(err);
    }
    if (!tasks.length) {
        return callback();
    }
    function wrapIterator(iterator) {
        return _restParam(function (err, args) {
            if (err) {
                callback.apply(null, [err].concat(args));
            }
            else {
                var next = iterator.next();
                if (next) {
                    args.push(wrapIterator(next));
                }
                else {
                    args.push(callback);
                }
                ensureAsync(iterator).apply(null, args);
            }
        });
    }
    wrapIterator(async.iterator(tasks))();
};

async.parallel = function (tasks, callback) {
    _parallel(async.eachOf, tasks, callback);
};

async.parallelLimit = function(tasks, limit, callback) {
    _parallel(_eachOfLimit(limit), tasks, callback);
};

async.series = function(tasks, callback) {
    _parallel(async.eachOfSeries, tasks, callback);
};

async.iterator = function (tasks) {
    function makeCallback(index) {
        function fn() {
            if (tasks.length) {
                tasks[index].apply(null, arguments);
            }
            return fn.next();
        }
        fn.next = function () {
            return (index < tasks.length - 1) ? makeCallback(index + 1): null;
        };
        return fn;
    }
    return makeCallback(0);
};

async.apply = _restParam(function (fn, args) {
    return _restParam(function (callArgs) {
        return fn.apply(
            null, args.concat(callArgs)
        );
    });
});

function _concat(eachfn, arr, fn, callback) {
    var result = [];
    eachfn(arr, function (x, index, cb) {
        fn(x, function (err, y) {
            result = result.concat(y || []);
            cb(err);
        });
    }, function (err) {
        callback(err, result);
    });
}
async.concat = doParallel(_concat);
async.concatSeries = doSeries(_concat);

async.whilst = function (test, iterator, callback) {
    callback = callback || noop;
    if (test()) {
        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else if (test.apply(this, args)) {
                iterator(next);
            } else {
                callback.apply(null, [null].concat(args));
            }
        });
        iterator(next);
    } else {
        callback(null);
    }
};

async.doWhilst = function (iterator, test, callback) {
    var calls = 0;
    return async.whilst(function() {
        return ++calls <= 1 || test.apply(this, arguments);
    }, iterator, callback);
};

async.until = function (test, iterator, callback) {
    return async.whilst(function() {
        return !test.apply(this, arguments);
    }, iterator, callback);
};

async.doUntil = function (iterator, test, callback) {
    return async.doWhilst(iterator, function() {
        return !test.apply(this, arguments);
    }, callback);
};

async.during = function (test, iterator, callback) {
    callback = callback || noop;

    var next = _restParam(function(err, args) {
        if (err) {
            callback(err);
        } else {
            args.push(check);
            test.apply(this, args);
        }
    });

    var check = function(err, truth) {
        if (err) {
            callback(err);
        } else if (truth) {
            iterator(next);
        } else {
            callback(null);
        }
    };

    test(check);
};

async.doDuring = function (iterator, test, callback) {
    var calls = 0;
    async.during(function(next) {
        if (calls++ < 1) {
            next(null, true);
        } else {
            test.apply(this, arguments);
        }
    }, iterator, callback);
};

function _queue(worker, concurrency, payload) {
    if (concurrency == null) {
        concurrency = 1;
    }
    else if(concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }
    function _insert(q, data, pos, callback) {
        if (callback != null && typeof callback !== "function") {
            throw new Error("task callback must be a function");
        }
        q.started = true;
        if (!_isArray(data)) {
            data = [data];
        }
        if(data.length === 0 && q.idle()) {
            // call drain immediately if there are no tasks
            return async.setImmediate(function() {
                q.drain();
            });
        }
        _arrayEach(data, function(task) {
            var item = {
                data: task,
                callback: callback || noop
            };

            if (pos) {
                q.tasks.unshift(item);
            } else {
                q.tasks.push(item);
            }

            if (q.tasks.length === q.concurrency) {
                q.saturated();
            }
        });
        async.setImmediate(q.process);
    }
    function _next(q, tasks) {
        return function(){
            workers -= 1;

            var removed = false;
            var args = arguments;
            _arrayEach(tasks, function (task) {
                _arrayEach(workersList, function (worker, index) {
                    if (worker === task && !removed) {
                        workersList.splice(index, 1);
                        removed = true;
                    }
                });

                task.callback.apply(task, args);
            });
            if (q.tasks.length + workers === 0) {
                q.drain();
            }
            q.process();
        };
    }

    var workers = 0;
    var workersList = [];
    var q = {
        tasks: [],
        concurrency: concurrency,
        payload: payload,
        saturated: noop,
        empty: noop,
        drain: noop,
        started: false,
        paused: false,
        push: function (data, callback) {
            _insert(q, data, false, callback);
        },
        kill: function () {
            q.drain = noop;
            q.tasks = [];
        },
        unshift: function (data, callback) {
            _insert(q, data, true, callback);
        },
        process: function () {
            while(!q.paused && workers < q.concurrency && q.tasks.length){

                var tasks = q.payload ?
                    q.tasks.splice(0, q.payload) :
                    q.tasks.splice(0, q.tasks.length);

                var data = _map(tasks, function (task) {
                    return task.data;
                });

                if (q.tasks.length === 0) {
                    q.empty();
                }
                workers += 1;
                workersList.push(tasks[0]);
                var cb = only_once(_next(q, tasks));
                worker(data, cb);
            }
        },
        length: function () {
            return q.tasks.length;
        },
        running: function () {
            return workers;
        },
        workersList: function () {
            return workersList;
        },
        idle: function() {
            return q.tasks.length + workers === 0;
        },
        pause: function () {
            q.paused = true;
        },
        resume: function () {
            if (q.paused === false) { return; }
            q.paused = false;
            var resumeCount = Math.min(q.concurrency, q.tasks.length);
            // Need to call q.process once per concurrent
            // worker to preserve full concurrency after pause
            for (var w = 1; w <= resumeCount; w++) {
                async.setImmediate(q.process);
            }
        }
    };
    return q;
}

async.queue = function (worker, concurrency) {
    var q = _queue(function (items, cb) {
        worker(items[0], cb);
    }, concurrency, 1);

    return q;
};

async.priorityQueue = function (worker, concurrency) {

    function _compareTasks(a, b){
        return a.priority - b.priority;
    }

    function _binarySearch(sequence, item, compare) {
        var beg = -1,
            end = sequence.length - 1;
        while (beg < end) {
            var mid = beg + ((end - beg + 1) >>> 1);
            if (compare(item, sequence[mid]) >= 0) {
                beg = mid;
            } else {
                end = mid - 1;
            }
        }
        return beg;
    }

    function _insert(q, data, priority, callback) {
        if (callback != null && typeof callback !== "function") {
            throw new Error("task callback must be a function");
        }
        q.started = true;
        if (!_isArray(data)) {
            data = [data];
        }
        if(data.length === 0) {
            // call drain immediately if there are no tasks
            return async.setImmediate(function() {
                q.drain();
            });
        }
        _arrayEach(data, function(task) {
            var item = {
                data: task,
                priority: priority,
                callback: typeof callback === 'function' ? callback : noop
            };

            q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

            if (q.tasks.length === q.concurrency) {
                q.saturated();
            }
            async.setImmediate(q.process);
        });
    }

    // Start with a normal queue
    var q = async.queue(worker, concurrency);

    // Override push to accept second parameter representing priority
    q.push = function (data, priority, callback) {
        _insert(q, data, priority, callback);
    };

    // Remove unshift function
    delete q.unshift;

    return q;
};

async.cargo = function (worker, payload) {
    return _queue(worker, 1, payload);
};

async.log = _console_fn('log');
async.dir = _console_fn('dir');
/*async.info = _console_fn('info');
async.warn = _console_fn('warn');
async.error = _console_fn('error');*/

async.memoize = function (fn, hasher) {
    var memo = {};
    var queues = {};
    hasher = hasher || identity;
    var memoized = _restParam(function memoized(args) {
        var callback = args.pop();
        var key = hasher.apply(null, args);
        if (key in memo) {
            async.setImmediate(function () {
                callback.apply(null, memo[key]);
            });
        }
        else if (key in queues) {
            queues[key].push(callback);
        }
        else {
            queues[key] = [callback];
            fn.apply(null, args.concat([_restParam(function (args) {
                memo[key] = args;
                var q = queues[key];
                delete queues[key];
                for (var i = 0, l = q.length; i < l; i++) {
                    q[i].apply(null, args);
                }
            })]));
        }
    });
    memoized.memo = memo;
    memoized.unmemoized = fn;
    return memoized;
};

async.unmemoize = function (fn) {
    return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
    };
};

async.times = _times(async.map);
async.timesSeries = _times(async.mapSeries);
async.timesLimit = function (count, limit, iterator, callback) {
    return async.mapLimit(_range(count), limit, iterator, callback);
};

async.seq = function (/* functions... */) {
    var fns = arguments;
    return _restParam(function (args) {
        var that = this;

        var callback = args[args.length - 1];
        if (typeof callback == 'function') {
            args.pop();
        } else {
            callback = noop;
        }

        async.reduce(fns, args, function (newargs, fn, cb) {
            fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                cb(err, nextargs);
            })]));
        },
        function (err, results) {
            callback.apply(that, [err].concat(results));
        });
    });
};

async.compose = function (/* functions... */) {
    return async.seq.apply(null, Array.prototype.reverse.call(arguments));
};

async.applyEach = _applyEach(async.eachOf);
async.applyEachSeries = _applyEach(async.eachOfSeries);


async.forever = function (fn, callback) {
    var done = only_once(callback || noop);
    var task = ensureAsync(fn);
    function next(err) {
        if (err) {
            return done(err);
        }
        task(next);
    }
    next();
};

async.ensureAsync = ensureAsync;

async.constant = _restParam(function(values) {
    var args = [null].concat(values);
    return function (callback) {
        return callback.apply(this, args);
    };
});

async.wrapSync =
async.asyncify = _asyncify;

module.exports = async;
