import copyArray from 'lodash/_copyArray';

export default function (fn) {
    return function (/*args..., callback*/) {
        var args = copyArray(arguments);
        var callback = args.pop();
        fn(args, callback);
    };
}
