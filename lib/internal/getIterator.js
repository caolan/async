export default function (coll) {
    return coll[Symbol.iterator] && coll[Symbol.iterator]();
}
