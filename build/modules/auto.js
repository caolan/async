'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (tasks, concurrency, callback) {
    if (typeof arguments[1] === 'function') {
        // concurrency is optional, shift the args.
        callback = concurrency;
        concurrency = null;
    }
    callback = (0, _once2.default)(callback || _noop2.default);
    var keys = (0, _keys2.default)(tasks);
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
        var idx = (0, _indexOf2.default)(listeners, fn);
        if (idx >= 0) listeners.splice(idx, 1);
    }
    function taskComplete() {
        remainingTasks--;
        (0, _arrayEach2.default)(listeners.slice(), function (fn) {
            fn();
        });
    }

    addListener(function () {
        if (!remainingTasks) {
            callback(null, results);
        }
    });

    (0, _arrayEach2.default)(keys, function (k) {
        var task = (0, _isArray2.default)(tasks[k]) ? tasks[k] : [tasks[k]];
        var taskCallback = (0, _rest2.default)(function (err, args) {
            runningTasks--;
            if (args.length <= 1) {
                args = args[0];
            }
            if (err) {
                var safeResults = {};
                (0, _forOwn2.default)(results, function (val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[k] = args;
                callback(err, safeResults);
            } else {
                results[k] = args;
                (0, _setImmediate2.default)(taskComplete);
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
            if ((0, _isArray2.default)(dep) && (0, _indexOf2.default)(dep, k) >= 0) {
                throw new Error('Has cyclic dependencies');
            }
        }
        function ready() {
            return runningTasks < concurrency && (0, _arrayEvery2.default)(requires, function (x) {
                return results.hasOwnProperty(x);
            }) && !results.hasOwnProperty(k);
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
};

var _arrayEach = require('../../deps/lodash-es/internal/arrayEach');

var _arrayEach2 = _interopRequireDefault(_arrayEach);

var _arrayEvery = require('../../deps/lodash-es/internal/arrayEvery');

var _arrayEvery2 = _interopRequireDefault(_arrayEvery);

var _forOwn = require('../../deps/lodash-es/object/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

var _indexOf = require('../../deps/lodash-es/array/indexOf');

var _indexOf2 = _interopRequireDefault(_indexOf);

var _isArray = require('../../deps/lodash-es/lang/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _keys = require('../../deps/lodash-es/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _noop = require('../../deps/lodash-es/utility/noop');

var _noop2 = _interopRequireDefault(_noop);

var _once = require('../../deps/lodash-es/function/once');

var _once2 = _interopRequireDefault(_once);

var _rest = require('../../deps/lodash-es/function/rest');

var _rest2 = _interopRequireDefault(_rest);

var _setImmediate = require('./internal/setImmediate');

var _setImmediate2 = _interopRequireDefault(_setImmediate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }