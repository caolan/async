'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (count, iterator, callback) {
    (0, _mapSeries2.default)((0, _baseRange2.default)(0, count, 1), iterator, callback);
};

var _mapSeries = require('./mapSeries');

var _mapSeries2 = _interopRequireDefault(_mapSeries);

var _baseRange = require('lodash/internal/baseRange');

var _baseRange2 = _interopRequireDefault(_baseRange);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }