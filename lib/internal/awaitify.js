// conditionally promisify a function.
// only return a promise if a callback is omitted
export default function awaitify (asyncFn, arity) {
    if (!arity) arity = asyncFn.length;
    if (!arity) throw new Error('arity is undefined')
    function awaitable (...args) {
        if (typeof args[arity - 1] === 'function') {
            return asyncFn.apply(this, args)
        }

        return new Promise((resolve, reject) => {
            args[arity - 1] = (err, ...cbArgs) => {
                if (err) return reject(err)
                resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0])
            }
            asyncFn.apply(this, args)
        })
    }

    return awaitable
}
