// Resolve the async version we currently want to test
console.log(process.env.ASYNC_TEST);
if (typeof process === 'object' && process.env.ASYNC_TEST === 'build') {
    console.log('testing built modules');
    module.exports = require('../..');
} else {
    console.log('testing source');
    module.exports = require('../../lib');
}
