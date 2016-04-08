import rest from 'lodash/rest';

export default function (fn) {
    return rest(function (args/*..., callback*/) {
        var callback = args.pop();
        fn.call(this, args, callback);
    });
}
