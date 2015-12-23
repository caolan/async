import arrayMap from 'lodash/internal/arrayMap';
import property from 'lodash/utility/property';

export default function _filter(eachfn, arr, iterator, callback) {
    var results = [];
    eachfn(arr, function (x, index, callback) {
        iterator(x, function (v) {
            if (v) {
                results.push({index: index, value: x});
            }
            callback();
        });
    }, function () {
        callback(arrayMap(results.sort(function (a, b) {
            return a.index - b.index;
        }), property('value')));
    });
}
