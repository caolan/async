export default function range(size) {
    var result = Array(size);
    while (size--) {
        result[size] = size;
    }
    return result;
}
