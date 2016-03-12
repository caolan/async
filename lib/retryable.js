import retry from './retry';
import rest from 'lodash/rest';

export default function (opts, task) {
    if (!task) {
        task = opts;
        opts = null;
    }
    return rest(function (args) {
        var callback = args.pop();

        function taskFn(cb) {
            task.apply(null, args.concat([cb]));
        }

        if (opts) retry(opts, taskFn, callback);
        else retry(taskFn, callback);

    });
}
