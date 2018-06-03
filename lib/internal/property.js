export default function property(property) {
    return function (object) {
        return object[property];
    }
}
