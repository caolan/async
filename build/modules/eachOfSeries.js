'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = eachOfSeries;

var _once = require('lodash/function/once');

var _once2 = _interopRequireDefault(_once);

var _noop = require('lodash/utility/noop');

var _noop2 = _interopRequireDefault(_noop);

var _keyIterator = require('./internal/keyIterator');

var _keyIterator2 = _interopRequireDefault(_keyIterator);

var _onlyOnce = require('./internal/onlyOnce');

var _onlyOnce2 = _interopRequireDefault(_onlyOnce);

var _setImmediate = require('./setImmediate');

var _setImmediate2 = _interopRequireDefault(_setImmediate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function eachOfSeries(obj, iterator, callback) {
    callback = (0, _once2.default)(callback || _noop2.default);
    obj = obj || [];
    var nextKey = (0, _keyIterator2.default)(obj);
    var key = nextKey();

    function iterate() {
        var sync = true;
        if (key === null) {
            return callback(null);
        }
        iterator(obj[key], key, (0, _onlyOnce2.default)(function (err) {
            if (err) {
                callback(err);
            } else {
                key = nextKey();
                if (key === null) {
                    return callback(null);
                } else {
                    if (sync) {
                        (0, _setImmediate2.default)(iterate);
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