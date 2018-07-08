export default function (fn) {
    return function (...args/*, callback*/) {
        var callback = args.pop();
        fn.call(this, args, callback);
    };
}
