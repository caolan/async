// conditionally promisify a function.
// only return a promise if a callback is omitted
export default function awaitify (asyncFn, arity) {
    const awaitable = function (...args) {
        if (args.length === arity || typeof args[arity - 1] === 'function') {
            return asyncFn.apply(this, args)
        }

        return new Promise((resolve, reject) => {
            args.push((err, ...cbArgs) => {
                if (err) return reject(err)
                resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0])
            })
            asyncFn.apply(this, args)
        })
    }

    Object.defineProperty(awaitable, 'name', {
        value: `awaitable(${asyncFn.name})`
    })

    return awaitable
}
