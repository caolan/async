'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = eachOf;

var _once = require('lodash/once');

var _once2 = _interopRequireDefault(_once);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _keyIterator = require('./internal/keyIterator');

var _keyIterator2 = _interopRequireDefault(_keyIterator);

var _onlyOnce = require('./internal/onlyOnce');

var _onlyOnce2 = _interopRequireDefault(_onlyOnce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function eachOf(object, iterator, callback) {
    callback = (0, _once2.default)(callback || _noop2.default);
    object = object || [];

    var iter = (0, _keyIterator2.default)(object);
    var key,
        completed = 0;

    while ((key = iter()) != null) {
        completed += 1;
        iterator(object[key], key, (0, _onlyOnce2.default)(done));
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
module.exports = exports['default'];