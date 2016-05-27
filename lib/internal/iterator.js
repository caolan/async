import isArrayLike from 'lodash/isArrayLike';
import getIterator from './getIterator';
import keys from 'lodash/keys';

export default function iterator(coll) {
    var i = -1;
    var len;
    if (isArrayLike(coll)) {
        len = coll.length;
        return function next() {
            i++;
            return i < len ? {value: coll[i], key: i} : null;
        };
    }

    var iterate = getIterator(coll);
    if (iterate) {
        return function next() {
            var item = iterate.next();
            if (item.done)
                return null;
            i++;
            return {value: item.value, key: i};
        };
    }

    var okeys = keys(coll);
    len = okeys.length;
    return function next() {
        i++;
        var key = okeys[i];
        return i < len ? {value: coll[key], key: key} : null;
    };
}
