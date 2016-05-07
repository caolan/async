module.exports = function (call_order) {
    return {
        one: function(callback) {
            setTimeout(function() {
                call_order.push(1);
                callback(null, 1);
            }, 125);
        },
        two: function(callback) {
            setTimeout(function() {
                call_order.push(2);
                callback(null, 2);
            }, 200);
        },
        three: function(callback) {
            setTimeout(function() {
                call_order.push(3);
                callback(null, 3, 3);
            }, 50);
        }
    };
};
