// run like this:
// node --harmony --use-strict test-strict.js

var async = require('../lib/async');

function hi() {
  let i = "abcd";
  for (let i = 0; i < 3; i++) {
    console.log(i);
  }
  console.log(i);
}
function hi2(){
  console.log("blah");
}

async.parallel([hi, hi2], function() {
  console.log("done");
});
