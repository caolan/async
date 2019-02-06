module.exports = function (call_order) {
    return {
        one(callback) {
            setTimeout(() => {
                call_order.push(1);
                callback(null, 1);
            }, 125);
        },
        two(callback) {
            setTimeout(() => {
                call_order.push(2);
                callback(null, 2);
            }, 350);
        },
        three(callback) {
            setTimeout(() => {
                call_order.push(3);
                callback(null, 3, 3);
            }, 50);
        }
    };
};
