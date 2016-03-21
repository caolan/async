import retry from './retry';
import initialParams from './internal/initialParams';

export default function (opts, task) {
    if (!task) {
        task = opts;
        opts = null;
    }
    return initialParams(function (args, callback) {
        function taskFn(cb) {
            task.apply(null, args.concat([cb]));
        }

        if (opts) retry(opts, taskFn, callback);
        else retry(taskFn, callback);

    });
}
