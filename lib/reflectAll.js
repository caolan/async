'use strict';

import reflect from './reflect';

export default function reflectAll(tasks) {
    return tasks.map(reflect);
}
