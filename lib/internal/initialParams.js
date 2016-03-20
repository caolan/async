import toArray from 'lodash/toArray';

export default function (fn) {
    return function (/*args..., callback*/) {
        var args = toArray(arguments);
        var callback = args.pop();
        fn(args, callback);
    };
}
