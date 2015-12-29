'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (count, iterator, callback) {
    (0, _map2.default)((0, _range2.default)(0, count), iterator, callback);
};

var _map = require('./map');

var _map2 = _interopRequireDefault(_map);

var _range = require('lodash/utility/range');

var _range2 = _interopRequireDefault(_range);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }