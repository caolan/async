import wrapAsync from './wrapAsync';

export default function consoleFunc(name) {
    return function (fn, ...args) {
        args.push(function (err, ...resultArgs) {
            if (typeof console === 'object') {
                if (err) {
                    if (console.error) {
                        console.error(err);
                    }
                } else if (console[name]) {
                    resultArgs.forEach(function (x) {
                        console[name](x);
                    });
                }
            }
        })
        wrapAsync(fn)(...args);
    };
}
