export default function _withoutIndex(iteratee) {
    return (value, index, callback) => iteratee(value, callback);
}
