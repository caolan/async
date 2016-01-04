'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (count, iterator, callback) {
    (0, _map2.default)((0, _baseRange2.default)(0, count, 1), iterator, callback);
};

var _map = require('./map');

var _map2 = _interopRequireDefault(_map);

var _baseRange = require('lodash/internal/baseRange');

var _baseRange2 = _interopRequireDefault(_baseRange);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }