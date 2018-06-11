export default function doLimit(fn, limit) {
    return (iterable, iteratee, cb) => fn(iterable, limit, iteratee, cb)
}
