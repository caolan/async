'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (count, iterator, callback) {
    (0, _mapSeries2.default)((0, _range2.default)(0, count), iterator, callback);
};

var _mapSeries = require('./mapSeries');

var _mapSeries2 = _interopRequireDefault(_mapSeries);

var _range = require('../../deps/lodash-es/utility/range');

var _range2 = _interopRequireDefault(_range);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }