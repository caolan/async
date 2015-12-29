'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = parallel;

var _parallel2 = require('./internal/parallel');

var _parallel3 = _interopRequireDefault(_parallel2);

var _eachOf = require('./eachOf');

var _eachOf2 = _interopRequireDefault(_eachOf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parallel(tasks, cb) {
    return (0, _parallel3.default)(_eachOf2.default, tasks, cb);
}