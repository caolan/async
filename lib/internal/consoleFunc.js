import wrapAsync from './wrapAsync';

export default function consoleFunc(name) {
    return (fn, ...args) => wrapAsync(fn)(...args, (err, ...resultArgs) => {
        if (typeof console === 'object') {
            if (err) {
                if (console.error) {
                    console.error(err);
                }
            } else if (console[name]) {
                resultArgs.forEach(x => console[name](x));
            }
        }
    })
}
