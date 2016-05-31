/**
 * Undoes a {@link async.memoize}d function, reverting it to the original,
 * unmemoized form. Handy for testing.
 *
 * @name unmemoize
 * @static
 * @memberOf async
 * @see async.memoize
 * @category Util
 * @param {Function} fn - the memoized function
 */
export default  function unmemoize(fn) {
    return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
    };
}
