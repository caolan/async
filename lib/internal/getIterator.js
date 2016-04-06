var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;

export default function (coll) {
    return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
}
