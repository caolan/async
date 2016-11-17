import _overRest from 'lodash/_overRest';
import identity from 'lodash/identity';

// Lodash rest function without function.toString()
// remappings
export default function rest(func, start) {
    return _overRest(func, start, identity);
}
