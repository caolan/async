import rest from 'lodash/_baseRest';

export default function (fn) {
    return rest(function (args/*..., callback*/) {
        var callback = args.pop();
        fn.call(this, args, callback);
    });
}
