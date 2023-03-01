export default function _withoutIndex(iteratee) {
    // return (value, index, callback) => iteratee(value, callback);
    return (value, index, callback) => {
        const result = iteratee(value, callback);
        if (result && typeof result.then === 'function') {
            return result.then(callback)
        }
        return result;
    }
}
