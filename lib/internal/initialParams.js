export default function (fn) {
    return function (...args/*, callback*/) {
        var callback = args.pop();
        return fn.call(this, args, callback);
    };
}
