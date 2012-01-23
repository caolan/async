var http = require('http');

function someFunction() {
  var buffer = new Buffer(128);

  setInterval();

  clearInterval(setInterval(function () {
    return;
  }, 1000));

  clearTimeout(setTimeout(function () {
    return;
  }, 1000));
}

exports.someFunction = someFunction;

console.log(module.filename === __filename);

console.log(__filename);

console.log(__dirname);

console.log(typeof global);

console.log(process.pid);

