var async = require('../../dist/async.js');
var $ = require('jquery');

defineGlobal('$', $);
defineGlobal('jQuery', $);
defineGlobal('async', async);

require('bootstrap');

function defineGlobal(name, lib) {
    global[name] = lib;
}
