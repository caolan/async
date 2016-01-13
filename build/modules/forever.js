'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = forever;

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _onlyOnce = require('./internal/onlyOnce');

var _onlyOnce2 = _interopRequireDefault(_onlyOnce);

var _ensureAsync = require('./ensureAsync');

var _ensureAsync2 = _interopRequireDefault(_ensureAsync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function forever(fn, cb) {
    var done = (0, _onlyOnce2.default)(cb || _noop2.default);
    var task = (0, _ensureAsync2.default)(fn);

    function next(err) {
        if (err) return done(err);
        task(next);
    }
    next();
}
module.exports = exports['default'];