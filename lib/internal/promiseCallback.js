import noop from 'lodash/noop';

var supportsPromise = typeof Promise === 'function';

export default supportsPromise ? promiseCallback : noopCallback;

function noopCallback() {
    return noop;
}

function promiseCallback() {
    var resolve, reject;
    function callback(err, value) {
        if (err) return reject(err);
        resolve(value);
    }

    callback.promise = new Promise(function (res, rej) {
        resolve = res;
        reject = rej;
    })

    return callback;
}
