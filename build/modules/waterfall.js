'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (tasks, cb) {
    cb = (0, _once2.default)(cb || _noop2.default);
    if (!(0, _isArray2.default)(tasks)) return cb(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return cb();

    function wrapIterator(iterator) {
        return (0, _rest2.default)(function (err, args) {
            if (err) {
                cb.apply(null, [err].concat(args));
            } else {
                var next = iterator.next();
                if (next) {
                    args.push(wrapIterator(next));
                } else {
                    args.push(cb);
                }
                (0, _ensureAsync2.default)(iterator).apply(null, args);
            }
        });
    }
    wrapIterator((0, _iterator2.default)(tasks))();
};

var _isArray = require('../../deps/lodash-es/lang/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _noop = require('../../deps/lodash-es/utility/noop');

var _noop2 = _interopRequireDefault(_noop);

var _once = require('../../deps/lodash-es/function/once');

var _once2 = _interopRequireDefault(_once);

var _rest = require('../../deps/lodash-es/function/rest');

var _rest2 = _interopRequireDefault(_rest);

var _ensureAsync = require('./ensureAsync');

var _ensureAsync2 = _interopRequireDefault(_ensureAsync);

var _iterator = require('./iterator');

var _iterator2 = _interopRequireDefault(_iterator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }