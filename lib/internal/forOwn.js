export default function forOwn(object, callback) {
    if (!object) {
        return;
    }
    Object.keys(object).forEach(function (key) {
        callback(object[key], key);
    });
}
