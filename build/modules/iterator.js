'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (tasks) {
    function makeCallback(index) {
        function fn() {
            if (tasks.length) {
                tasks[index].apply(null, arguments);
            }
            return fn.next();
        }
        fn.next = function () {
            return index < tasks.length - 1 ? makeCallback(index + 1) : null;
        };
        return fn;
    }
    return makeCallback(0);
};

module.exports = exports['default'];