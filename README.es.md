![Async Logo](https://raw.githubusercontent.com/caolan/async/master/logo/async-logo_readme.jpg)

[![Build Status via Travis CI](https://travis-ci.org/caolan/async.svg?branch=master)](https://travis-ci.org/caolan/async)
[![NPM version](https://img.shields.io/npm/v/async.svg)](https://www.npmjs.com/package/async)
[![Coverage Status](https://coveralls.io/repos/caolan/async/badge.svg?branch=master)](https://coveralls.io/r/caolan/async?branch=master)
[![Join the chat at https://gitter.im/caolan/async](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/caolan/async?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![libhive - Open source examples](https://www.libhive.com/providers/npm/packages/async/examples/badge.svg)](https://www.libhive.com/providers/npm/packages/async)
[![jsDelivr Hits](https://data.jsdelivr.com/v1/package/npm/async/badge?style=rounded)](https://www.jsdelivr.com/package/npm/async)


Async is a utility module which provides straight-forward, powerful functions for working with [asynchronous JavaScript](http://caolan.github.io/async/global.html). Although originally designed for use with [Node.js](https://nodejs.org/) and installable via `npm install --save async`, it can also be used directly in the browser.

This version of the package is optimized for building with webpack. If you use Async in Node.js, install [`async`](https://www.npmjs.com/package/async) instead.

For Documentation, visit <https://caolan.github.io/async/>

*For Async v1.5.x documentation, go [HERE](https://github.com/caolan/async/blob/v1.5.2/README.md)*


```javascript
// for use with callbacks...
import { forEachOf } from "async-es";

const images = {cat: "/cat.png", dog: "/dog.png", duck: "/duck.png"};
const sizes = {};

forEachOf(images, (value, key, callback) => {
    const imageElem = new Image();
    imageElem.src = value;
    imageElem.addEventListener("load", () => {
        sizes[key] = {
            width: imageElem.naturalWidth,
            height: imageElem.naturalHeight,
        };
        callback();
    });
    imageElem.addEventListener("error", (e) => {
        callback(e);
    });
}, err => {
    if (err) console.error(err.message);
    // `sizes` is now a map of image sizes
    doSomethingWith(sizes);
});
```

```javascript
import { mapLimit } from "async-es";

// ...or ES2017 async functions
mapLimit(urls, 5, async function(url) {
    const response = await fetch(url)
    return response.body
}, (err, results) => {
    if (err) throw err
    // results is now an array of the response bodies
    console.log(results)
})
```
