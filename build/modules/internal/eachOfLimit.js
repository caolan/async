'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _eachOfLimit;

var _noop = require('lodash/utility/noop');

var _noop2 = _interopRequireDefault(_noop);

var _once = require('lodash/function/once');

var _once2 = _interopRequireDefault(_once);

var _keyIterator = require('./keyIterator');

var _keyIterator2 = _interopRequireDefault(_keyIterator);

var _onlyOnce = require('./onlyOnce');

var _onlyOnce2 = _interopRequireDefault(_onlyOnce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _eachOfLimit(limit) {
    return function (obj, iterator, callback) {
        callback = (0, _once2.default)(callback || _noop2.default);
        obj = obj || [];
        var nextKey = (0, _keyIterator2.default)(obj);
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
                iterator(obj[key], key, (0, _onlyOnce2.default)(function (err) {
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