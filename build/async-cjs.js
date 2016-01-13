'use strict';

var rest = require('lodash/rest');
rest = 'default' in rest ? rest['default'] : rest;
var isObject = require('lodash/isObject');
isObject = 'default' in isObject ? isObject['default'] : isObject;
var arrayEach = require('lodash/internal/arrayEach');
arrayEach = 'default' in arrayEach ? arrayEach['default'] : arrayEach;
var arrayEvery = require('lodash/internal/arrayEvery');
arrayEvery = 'default' in arrayEvery ? arrayEvery['default'] : arrayEvery;
var baseHas = require('lodash/internal/baseHas');
baseHas = 'default' in baseHas ? baseHas['default'] : baseHas;
var forOwn = require('lodash/forOwn');
forOwn = 'default' in forOwn ? forOwn['default'] : forOwn;
var indexOf = require('lodash/indexOf');
indexOf = 'default' in indexOf ? indexOf['default'] : indexOf;
var isArray = require('lodash/isArray');
isArray = 'default' in isArray ? isArray['default'] : isArray;
var okeys = require('lodash/keys');
okeys = 'default' in okeys ? okeys['default'] : okeys;
var noop = require('lodash/noop');
noop = 'default' in noop ? noop['default'] : noop;
var once = require('lodash/once');
once = 'default' in once ? once['default'] : once;
var identity = require('lodash/identity');
identity = 'default' in identity ? identity['default'] : identity;
var arrayMap = require('lodash/internal/arrayMap');
arrayMap = 'default' in arrayMap ? arrayMap['default'] : arrayMap;
var property = require('lodash/internal/baseProperty');
property = 'default' in property ? property['default'] : property;
var range = require('lodash/internal/baseRange');
range = 'default' in range ? range['default'] : range;
var isArrayLike = require('lodash/isArrayLike');
isArrayLike = 'default' in isArrayLike ? isArrayLike['default'] : isArrayLike;

function asyncify(func) {
    return rest(function (args) {
        var callback = args.pop();
        var result;
        try {
            result = func.apply(this, args);
        } catch (e) {
            return callback(e);
        }
        // if result is Promise object
        if (isObject(result) && typeof result.then === 'function') {
            result.then(function (value) {
                callback(null, value);
            })['catch'](function (err) {
                callback(err.message ? err : new Error(err));
            });
        } else {
            callback(null, result);
        }
    });
}

function _filter(eachfn, arr, iterator, callback) {
    var results = [];
    eachfn(arr, function (x, index, callback) {
        iterator(x, function (v) {
            if (v) {
                results.push({ index: index, value: x });
            }
            callback();
        });
    }, function () {
        callback(arrayMap(results.sort(function (a, b) {
            return a.index - b.index;
        }), property('value')));
    });
}

function keyIterator(coll) {
    var i = -1;
    var len;
    if (isArrayLike(coll)) {
        len = coll.length;
        return function next() {
            i++;
            return i < len ? i : null;
        };
    } else {
        var okeys$$ = okeys(coll);
        len = okeys$$.length;
        return function next() {
            i++;
            return i < len ? okeys$$[i] : null;
        };
    }
}

function onlyOnce(fn) {
    return function () {
        if (fn === null) throw new Error("Callback was already called.");
        fn.apply(this, arguments);
        fn = null;
    };
}

var _setImmediate = typeof setImmediate === 'function' && setImmediate;

var _delay;
if (_setImmediate) {
    _delay = function (fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    };
} else if (typeof process === 'object' && typeof process.nextTick === 'function') {
    _delay = process.nextTick;
} else {
    _delay = function (fn) {
        setTimeout(fn, 0);
    };
}

var setImmediate$1 = _delay;

function eachOfSeries(obj, iterator, callback) {
    callback = once(callback || noop);
    obj = obj || [];
    var nextKey = keyIterator(obj);
    var key = nextKey();

    function iterate() {
        var sync = true;
        if (key === null) {
            return callback(null);
        }
        iterator(obj[key], key, onlyOnce(function (err) {
            if (err) {
                callback(err);
            } else {
                key = nextKey();
                if (key === null) {
                    return callback(null);
                } else {
                    if (sync) {
                        setImmediate$1(iterate);
                    } else {
                        iterate();
                    }
                }
            }
        }));
        sync = false;
    }
    iterate();
}

function doSeries(fn) {
    return function (obj, iterator, callback) {
        return fn(eachOfSeries, obj, iterator, callback);
    };
}

var filterSeries = doSeries(_filter);

function _eachOfLimit(limit) {
    return function (obj, iterator, callback) {
        callback = once(callback || noop);
        obj = obj || [];
        var nextKey = keyIterator(obj);
        if (limit <= 0) {
            return callback(null);
        }
        var done = false;
        var running = 0;
        var errored = false;

        (function replenish() {
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
                iterator(obj[key], key, onlyOnce(function (err) {
                    running -= 1;
                    if (err) {
                        callback(err);
                        errored = true;
                    } else {
                        replenish();
                    }
                }));
            }
        })();
    };
}

function doParallelLimit(fn) {
    return function (obj, limit, iterator, callback) {
        return fn(_eachOfLimit(limit), obj, iterator, callback);
    };
}

var filterLimit = doParallelLimit(_filter);

function eachOf(object, iterator, callback) {
    callback = once(callback || noop);
    object = object || [];

    var iter = keyIterator(object);
    var key,
        completed = 0;

    while ((key = iter()) != null) {
        completed += 1;
        iterator(object[key], key, onlyOnce(done));
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
}

function doParallel(fn) {
    return function (obj, iterator, callback) {
        return fn(eachOf, obj, iterator, callback);
    };
}

var filter = doParallel(_filter);

function reduce(arr, memo, iterator, cb) {
    eachOfSeries(arr, function (x, i, cb) {
        iterator(memo, x, function (err, v) {
            memo = v;
            cb(err);
        });
    }, function (err) {
        cb(err, memo);
    });
}

var slice = Array.prototype.slice;

function reduceRight(arr, memo, iterator, cb) {
    var reversed = slice.call(arr).reverse();
    reduce(reversed, memo, iterator, cb);
}

function eachOfLimit(obj, limit, iterator, cb) {
    _eachOfLimit(limit)(obj, iterator, cb);
}

function _withoutIndex(iterator) {
    return function (value, index, callback) {
        return iterator(value, callback);
    };
}

function eachLimit(arr, limit, iterator, cb) {
    return _eachOfLimit(limit)(arr, _withoutIndex(iterator), cb);
}

function eachSeries(arr, iterator, cb) {
    return eachOfSeries(arr, _withoutIndex(iterator), cb);
}

function each(arr, iterator, cb) {
    return eachOf(arr, _withoutIndex(iterator), cb);
}

function _createTester(eachfn, check, getResult) {
    return function (arr, limit, iterator, cb) {
        function done() {
            if (cb) cb(getResult(false, void 0));
        }
        function iteratee(x, _, callback) {
            if (!cb) return callback();
            iterator(x, function (v) {
                if (cb && check(v)) {
                    cb(getResult(true, x));
                    cb = iterator = false;
                }
                callback();
            });
        }
        if (arguments.length > 3) {
            eachfn(arr, limit, iteratee, done);
        } else {
            cb = iterator;
            iterator = limit;
            eachfn(arr, iteratee, done);
        }
    };
}

var some = _createTester(eachOf, Boolean, identity);

function notId(v) {
    return !v;
}

var every = _createTester(eachOf, notId, notId);

function whilst(test, iterator, cb) {
    cb = cb || noop;
    if (!test()) return cb(null);
    var next = rest(function (err, args) {
        if (err) return cb(err);
        if (test.apply(this, args)) return iterator(next);
        cb.apply(null, [null].concat(args));
    });
    iterator(next);
}

function ensureAsync(fn) {
    return rest(function (args) {
        var callback = args.pop();
        var sync = true;
        args.push(function () {
            var innerArgs = arguments;
            if (sync) {
                setImmediate$1(function () {
                    callback.apply(null, innerArgs);
                });
            } else {
                callback.apply(null, innerArgs);
            }
        });
        fn.apply(this, args);
        sync = false;
    });
}

function iterator (tasks) {
    function makeCallback(index) {
        function fn() {
            if (tasks.length) {
                tasks[index].apply(null, arguments);
            }
            return fn.next();
        }
        fn.next = function () {
            return index < tasks.length - 1 ? makeCallback(index + 1) : null;
        };
        return fn;
    }
    return makeCallback(0);
}

function waterfall (tasks, cb) {
    cb = once(cb || noop);
    if (!isArray(tasks)) return cb(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return cb();

    function wrapIterator(iterator) {
        return rest(function (err, args) {
            if (err) {
                cb.apply(null, [err].concat(args));
            } else {
                var next = iterator.next();
                if (next) {
                    args.push(wrapIterator(next));
                } else {
                    args.push(cb);
                }
                ensureAsync(iterator).apply(null, args);
            }
        });
    }
    wrapIterator(iterator(tasks))();
}

function until(test, iterator, cb) {
    return whilst(function () {
        return !test.apply(this, arguments);
    }, iterator, cb);
}

function unmemoize(fn) {
    return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
    };
}

function transform(arr, memo, iterator, callback) {
    if (arguments.length === 3) {
        callback = iterator;
        iterator = memo;
        memo = isArray(arr) ? [] : {};
    }

    eachOf(arr, function (v, k, cb) {
        iterator(memo, v, k, cb);
    }, function (err) {
        callback(err, memo);
    });
}

function _asyncMap(eachfn, arr, iterator, callback) {
    callback = once(callback || noop);
    arr = arr || [];
    var results = isArrayLike(arr) ? [] : {};
    eachfn(arr, function (value, index, callback) {
        iterator(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

var mapSeries = doSeries(_asyncMap);

function timesSeries (count, iterator, callback) {
    mapSeries(range(0, count, 1), iterator, callback);
}

var mapLimit = doParallelLimit(_asyncMap);

function timeLimit(count, limit, iterator, cb) {
    return mapLimit(range(0, count, 1), limit, iterator, cb);
}

var map = doParallel(_asyncMap);

function times (count, iterator, callback) {
    map(range(0, count, 1), iterator, callback);
}

function sortBy(arr, iterator, cb) {
    map(arr, function (x, cb) {
        iterator(x, function (err, criteria) {
            if (err) return cb(err);
            cb(null, { value: x, criteria: criteria });
        });
    }, function (err, results) {
        if (err) return cb(err);
        cb(null, arrayMap(results.sort(comparator), property('value')));
    });

    function comparator(left, right) {
        var a = left.criteria,
            b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }
}

var someLimit = _createTester(eachOfLimit, Boolean, identity);

function _parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, function (task, key, callback) {
        task(rest(function (err, args) {
            if (args.length <= 1) {
                args = args[0];
            }
            results[key] = args;
            callback(err);
        }));
    }, function (err) {
        callback(err, results);
    });
}

function series(tasks, cb) {
    return _parallel(eachOfSeries, tasks, cb);
}

function seq() /* functions... */{
    var fns = arguments;
    return rest(function (args) {
        var that = this;

        var cb = args[args.length - 1];
        if (typeof cb == 'function') {
            args.pop();
        } else {
            cb = noop;
        }

        reduce(fns, args, function (newargs, fn, cb) {
            fn.apply(that, newargs.concat([rest(function (err, nextargs) {
                cb(err, nextargs);
            })]));
        }, function (err, results) {
            cb.apply(that, [err].concat(results));
        });
    });
}

function retry(times, task, callback) {
    var DEFAULT_TIMES = 5;
    var DEFAULT_INTERVAL = 0;

    var attempts = [];

    var opts = {
        times: DEFAULT_TIMES,
        interval: DEFAULT_INTERVAL
    };

    function parseTimes(acc, t) {
        if (typeof t === 'number') {
            acc.times = parseInt(t, 10) || DEFAULT_TIMES;
        } else if (typeof t === 'object') {
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
            return function (seriesCallback) {
                task(function (err, result) {
                    seriesCallback(!err || finalAttempt, {
                        err: err,
                        result: result
                    });
                }, wrappedResults);
            };
        }

        function retryInterval(interval) {
            return function (seriesCallback) {
                setTimeout(function () {
                    seriesCallback(null);
                }, interval);
            };
        }

        while (opts.times) {

            var finalAttempt = !(opts.times -= 1);
            attempts.push(retryAttempt(opts.task, finalAttempt));
            if (!finalAttempt && opts.interval > 0) {
                attempts.push(retryInterval(opts.interval));
            }
        }

        series(attempts, function (done, data) {
            data = data[data.length - 1];
            (wrappedCallback || opts.callback)(data.err, data.result);
        });
    }

    // If a callback is passed, run this as a controll flow
    return opts.callback ? wrappedTask() : wrappedTask;
}

function reject$1(eachfn, arr, iterator, callback) {
    _filter(eachfn, arr, function (value, cb) {
        iterator(value, function (v) {
            cb(!v);
        });
    }, callback);
}

var rejectSeries = doSeries(reject$1);

var rejectLimit = doParallelLimit(reject$1);

var reject = doParallel(reject$1);

function queue$1(worker, concurrency, payload) {
    if (concurrency == null) {
        concurrency = 1;
    } else if (concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }
    function _insert(q, data, pos, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0 && q.idle()) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function () {
                q.drain();
            });
        }
        arrayEach(data, function (task) {
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
        setImmediate$1(q.process);
    }
    function _next(q, tasks) {
        return function () {
            workers -= 1;

            var removed = false;
            var args = arguments;
            arrayEach(tasks, function (task) {
                arrayEach(workersList, function (worker, index) {
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
            while (!q.paused && workers < q.concurrency && q.tasks.length) {

                var tasks = q.payload ? q.tasks.splice(0, q.payload) : q.tasks.splice(0, q.tasks.length);

                var data = arrayMap(tasks, property('data'));

                if (q.tasks.length === 0) {
                    q.empty();
                }
                workers += 1;
                workersList.push(tasks[0]);
                var cb = onlyOnce(_next(q, tasks));
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
        idle: function () {
            return q.tasks.length + workers === 0;
        },
        pause: function () {
            q.paused = true;
        },
        resume: function () {
            if (q.paused === false) {
                return;
            }
            q.paused = false;
            var resumeCount = Math.min(q.concurrency, q.tasks.length);
            // Need to call q.process once per concurrent
            // worker to preserve full concurrency after pause
            for (var w = 1; w <= resumeCount; w++) {
                setImmediate$1(q.process);
            }
        }
    };
    return q;
}

function queue (worker, concurrency) {
    return queue$1(function (items, cb) {
        worker(items[0], cb);
    }, concurrency, 1);
}

function priorityQueue (worker, concurrency) {
    function _compareTasks(a, b) {
        return a.priority - b.priority;
    }

    function _binarySearch(sequence, item, compare) {
        var beg = -1,
            end = sequence.length - 1;
        while (beg < end) {
            var mid = beg + (end - beg + 1 >>> 1);
            if (compare(item, sequence[mid]) >= 0) {
                beg = mid;
            } else {
                end = mid - 1;
            }
        }
        return beg;
    }

    function _insert(q, data, priority, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function () {
                q.drain();
            });
        }
        arrayEach(data, function (task) {
            var item = {
                data: task,
                priority: priority,
                callback: typeof callback === 'function' ? callback : noop
            };

            q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

            if (q.tasks.length === q.concurrency) {
                q.saturated();
            }
            setImmediate$1(q.process);
        });
    }

    // Start with a normal queue
    var q = queue(worker, concurrency);

    // Override push to accept second parameter representing priority
    q.push = function (data, priority, callback) {
        _insert(q, data, priority, callback);
    };

    // Remove unshift function
    delete q.unshift;

    return q;
}

function parallelLimit(tasks, limit, cb) {
    return _parallel(_eachOfLimit(limit), tasks, cb);
}

function parallel(tasks, cb) {
    return _parallel(eachOf, tasks, cb);
}

var nexTick = typeof process === 'object' && typeof process.nextTick === 'function' ? process.nextTick : setImmediate$1;

function memoize(fn, hasher) {
    var memo = {};
    var queues = {};
    hasher = hasher || identity;
    var memoized = rest(function memoized(args) {
        var callback = args.pop();
        var key = hasher.apply(null, args);
        if (key in memo) {
            setImmediate$1(function () {
                callback.apply(null, memo[key]);
            });
        } else if (key in queues) {
            queues[key].push(callback);
        } else {
            queues[key] = [callback];
            fn.apply(null, args.concat([rest(function (args) {
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
}

function consoleFunc(name) {
    return rest(function (fn, args) {
        fn.apply(null, args.concat([rest(function (err, args) {
            if (typeof console === 'object') {
                if (err) {
                    if (console.error) {
                        console.error(err);
                    }
                } else if (console[name]) {
                    arrayEach(args, function (x) {
                        console[name](x);
                    });
                }
            }
        })]));
    });
}

var log = consoleFunc('log');

function forever(fn, cb) {
    var done = onlyOnce(cb || noop);
    var task = ensureAsync(fn);

    function next(err) {
        if (err) return done(err);
        task(next);
    }
    next();
}

var everyLimit = _createTester(eachOfLimit, notId, notId);

function during(test, iterator, cb) {
    cb = cb || noop;

    var next = rest(function (err, args) {
        if (err) {
            cb(err);
        } else {
            args.push(check);
            test.apply(this, args);
        }
    });

    var check = function (err, truth) {
        if (err) return cb(err);
        if (!truth) return cb(null);
        iterator(next);
    };

    test(check);
}

function doWhilst(iterator, test, cb) {
    var calls = 0;
    return whilst(function () {
        return ++calls <= 1 || test.apply(this, arguments);
    }, iterator, cb);
}

function doUntil(iterator, test, cb) {
    return doWhilst(iterator, function () {
        return !test.apply(this, arguments);
    }, cb);
}

function doDuring(iterator, test, cb) {
    var calls = 0;

    during(function (next) {
        if (calls++ < 1) return next(null, true);
        test.apply(this, arguments);
    }, iterator, cb);
}

var dir = consoleFunc('dir');

function _findGetResult(v, x) {
    return x;
}

var detectSeries = _createTester(eachOfSeries, identity, _findGetResult);

var detectLimit = _createTester(eachOfLimit, identity, _findGetResult);

var detect = _createTester(eachOf, identity, _findGetResult);

var constant = rest(function (values) {
    var args = [null].concat(values);
    return function (cb) {
        return cb.apply(this, args);
    };
});

function concat$1(eachfn, arr, fn, callback) {
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

var concatSeries = doSeries(concat$1);

var concat = doParallel(concat$1);

var reverse = Array.prototype.reverse;

function compose() /* functions... */{
    return seq.apply(null, reverse.call(arguments));
}

function cargo(worker, payload) {
    return queue$1(worker, 1, payload);
}

function auto (tasks, concurrency, callback) {
    if (typeof arguments[1] === 'function') {
        // concurrency is optional, shift the args.
        callback = concurrency;
        concurrency = null;
    }
    callback = once(callback || noop);
    var keys = okeys(tasks);
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
        var idx = indexOf(listeners, fn);
        if (idx >= 0) listeners.splice(idx, 1);
    }
    function taskComplete() {
        remainingTasks--;
        arrayEach(listeners.slice(), function (fn) {
            fn();
        });
    }

    addListener(function () {
        if (!remainingTasks) {
            callback(null, results);
        }
    });

    arrayEach(keys, function (k) {
        var task = isArray(tasks[k]) ? tasks[k] : [tasks[k]];
        var taskCallback = rest(function (err, args) {
            runningTasks--;
            if (args.length <= 1) {
                args = args[0];
            }
            if (err) {
                var safeResults = {};
                forOwn(results, function (val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[k] = args;
                callback(err, safeResults);
            } else {
                results[k] = args;
                setImmediate$1(taskComplete);
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
            if (isArray(dep) && indexOf(dep, k) >= 0) {
                throw new Error('Has cyclic dependencies');
            }
        }
        function ready() {
            return runningTasks < concurrency && !baseHas(results, k) && arrayEvery(requires, function (x) {
                return baseHas(results, x);
            });
        }
        if (ready()) {
            runningTasks++;
            task[task.length - 1](taskCallback, results);
        } else {
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
}

var apply = rest(function (fn, args) {
    return rest(function (callArgs) {
        return fn.apply(null, args.concat(callArgs));
    });
});

function applyEach$1(eachfn) {
    return rest(function (fns, args) {
        var go = rest(function (args) {
            var that = this;
            var callback = args.pop();
            return eachfn(fns, function (fn, _, cb) {
                fn.apply(that, args.concat([cb]));
            }, callback);
        });
        if (args.length) {
            return go.apply(this, args);
        } else {
            return go;
        }
    });
}

var applyEachSeries = applyEach$1(eachOfSeries);

var applyEach = applyEach$1(eachOf);

var index = {
    applyEach: applyEach,
    applyEachSeries: applyEachSeries,
    apply: apply,
    asyncify: asyncify,
    auto: auto,
    cargo: cargo,
    compose: compose,
    concat: concat,
    concatSeries: concatSeries,
    constant: constant,
    detect: detect,
    detectLimit: detectLimit,
    detectSeries: detectSeries,
    dir: dir,
    doDuring: doDuring,
    doUntil: doUntil,
    doWhilst: doWhilst,
    during: during,
    each: each,
    eachLimit: eachLimit,
    eachOf: eachOf,
    eachOfLimit: eachOfLimit,
    eachOfSeries: eachOfSeries,
    eachSeries: eachSeries,
    ensureAsync: ensureAsync,
    every: every,
    everyLimit: everyLimit,
    filter: filter,
    filterLimit: filterLimit,
    filterSeries: filterSeries,
    forever: forever,
    iterator: iterator,
    log: log,
    map: map,
    mapLimit: mapLimit,
    mapSeries: mapSeries,
    memoize: memoize,
    nextTick: nexTick,
    parallel: parallel,
    parallelLimit: parallelLimit,
    priorityQueue: priorityQueue,
    queue: queue,
    reduce: reduce,
    reduceRight: reduceRight,
    reject: reject,
    rejectLimit: rejectLimit,
    rejectSeries: rejectSeries,
    retry: retry,
    seq: seq,
    series: series,
    setImmediate: setImmediate$1,
    some: some,
    someLimit: someLimit,
    sortBy: sortBy,
    times: times,
    timesLimit: timeLimit,
    timesSeries: timesSeries,
    transform: transform,
    unmemoize: unmemoize,
    until: until,
    waterfall: waterfall,
    whilst: whilst,

    // aliases
    all: every,
    any: some,
    forEach: each,
    forEachSeries: eachSeries,
    forEachLimit: eachLimit,
    forEachOf: eachOf,
    forEachOfSeries: eachOfSeries,
    forEachOfLimit: eachOfLimit,
    inject: reduce,
    foldl: reduce,
    foldr: reduceRight,
    select: filter,
    selectLimit: filterLimit,
    selectSeries: filterSeries,
    wrapSync: asyncify
};

exports['default'] = index;
exports.applyEach = applyEach;
exports.applyEachSeries = applyEachSeries;
exports.apply = apply;
exports.asyncify = asyncify;
exports.auto = auto;
exports.cargo = cargo;
exports.compose = compose;
exports.concat = concat;
exports.concatSeries = concatSeries;
exports.constant = constant;
exports.detect = detect;
exports.detectLimit = detectLimit;
exports.detectSeries = detectSeries;
exports.dir = dir;
exports.doDuring = doDuring;
exports.doUntil = doUntil;
exports.doWhilst = doWhilst;
exports.during = during;
exports.each = each;
exports.eachLimit = eachLimit;
exports.eachOf = eachOf;
exports.eachOfLimit = eachOfLimit;
exports.eachOfSeries = eachOfSeries;
exports.eachSeries = eachSeries;
exports.ensureAsync = ensureAsync;
exports.every = every;
exports.everyLimit = everyLimit;
exports.filter = filter;
exports.filterLimit = filterLimit;
exports.filterSeries = filterSeries;
exports.forever = forever;
exports.iterator = iterator;
exports.log = log;
exports.map = map;
exports.mapLimit = mapLimit;
exports.mapSeries = mapSeries;
exports.memoize = memoize;
exports.nextTick = nexTick;
exports.parallel = parallel;
exports.parallelLimit = parallelLimit;
exports.priorityQueue = priorityQueue;
exports.queue = queue;
exports.reduce = reduce;
exports.reduceRight = reduceRight;
exports.reject = reject;
exports.rejectLimit = rejectLimit;
exports.rejectSeries = rejectSeries;
exports.retry = retry;
exports.seq = seq;
exports.series = series;
exports.setImmediate = setImmediate$1;
exports.some = some;
exports.someLimit = someLimit;
exports.sortBy = sortBy;
exports.times = times;
exports.timesLimit = timeLimit;
exports.timesSeries = timesSeries;
exports.transform = transform;
exports.unmemoize = unmemoize;
exports.until = until;
exports.waterfall = waterfall;
exports.whilst = whilst;
exports.all = every;
exports.any = some;
exports.forEach = each;
exports.forEachSeries = eachSeries;
exports.forEachLimit = eachLimit;
exports.forEachOf = eachOf;
exports.forEachOfSeries = eachOfSeries;
exports.forEachOfLimit = eachOfLimit;
exports.inject = reduce;
exports.foldl = reduce;
exports.foldr = reduceRight;
exports.select = filter;
exports.selectLimit = filterLimit;
exports.selectSeries = filterSeries;
exports.wrapSync = asyncify;