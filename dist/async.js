(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.async = {})));
}(this, function (exports) { 'use strict';

  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {...*} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */
  function apply$1(func, thisArg, args) {
    var length = args.length;
    switch (length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  /**
   * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  var funcTag = '[object Function]';
  var genTag = '[object GeneratorFunction]';
  /** Used for built-in method references. */
  var objectProto$4 = Object.prototype;

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString$2 = objectProto$4.toString;

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 8 which returns 'object' for typed array constructors, and
    // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
    var tag = isObject(value) ? objectToString$2.call(value) : '';
    return tag == funcTag || tag == genTag;
  }

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

  /** Used to match leading and trailing whitespace. */
  var reTrim = /^\s+|\s+$/g;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3);
   * // => 3
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3');
   * // => 3
   */
  function toNumber(value) {
    if (isObject(value)) {
      var other = isFunction(value.valueOf) ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  var INFINITY = 1 / 0;
  var MAX_INTEGER = 1.7976931348623157e+308;
  /**
   * Converts `value` to an integer.
   *
   * **Note:** This function is loosely based on [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted integer.
   * @example
   *
   * _.toInteger(3);
   * // => 3
   *
   * _.toInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toInteger(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toInteger('3');
   * // => 3
   */
  function toInteger(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
      var sign = (value < 0 ? -1 : 1);
      return sign * MAX_INTEGER;
    }
    var remainder = value % 1;
    return value === value ? (remainder ? value - remainder : value) : 0;
  }

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max;

  /**
   * Creates a function that invokes `func` with the `this` binding of the
   * created function and arguments from `start` and beyond provided as an array.
   *
   * **Note:** This method is based on the [rest parameter](https://mdn.io/rest_parameters).
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var say = _.rest(function(what, names) {
   *   return what + ' ' + _.initial(names).join(', ') +
   *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
   * });
   *
   * say('hello', 'fred', 'barney', 'pebbles');
   * // => 'hello fred, barney, & pebbles'
   */
  function rest(func, start) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    start = nativeMax(start === undefined ? (func.length - 1) : toInteger(start), 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      switch (start) {
        case 0: return func.call(this, array);
        case 1: return func.call(this, args[0], array);
        case 2: return func.call(this, args[0], args[1], array);
      }
      var otherArgs = Array(start + 1);
      index = -1;
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = array;
      return apply$1(func, this, otherArgs);
    };
  }

  function applyEach$1(eachfn) {
      return rest(function (fns, args) {
          var go = rest(function (args) {
              var that = this;
              var callback = args.pop();
              return eachfn(fns, function (fn, _, cb) {
                  fn.apply(that, args.concat([cb]));
              }, callback);
          });
          if (args.length) {
              return go.apply(this, args);
          } else {
              return go;
          }
      });
  }

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT$1 = 'Expected a function';

  /**
   * Creates a function that invokes `func`, with the `this` binding and arguments
   * of the created function, while it's called less than `n` times. Subsequent
   * calls to the created function return the result of the last `func` invocation.
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {number} n The number of calls at which `func` is no longer invoked.
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new restricted function.
   * @example
   *
   * jQuery(element).on('click', _.before(5, addContactToList));
   * // => allows adding up to 4 contacts to the list
   */
  function before(n, func) {
    var result;
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$1);
    }
    n = toInteger(n);
    return function() {
      if (--n > 0) {
        result = func.apply(this, arguments);
      }
      if (n <= 1) {
        func = undefined;
      }
      return result;
    };
  }

  /**
   * Creates a function that is restricted to invoking `func` once. Repeat calls
   * to the function return the value of the first invocation. The `func` is
   * invoked with the `this` binding and arguments of the created function.
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new restricted function.
   * @example
   *
   * var initialize = _.once(createApplication);
   * initialize();
   * initialize();
   * // `initialize` invokes `createApplication` once
   */
  function once(func) {
    return before(2, func);
  }

  /**
   * A no-operation function that returns `undefined` regardless of the
   * arguments it receives.
   *
   * @static
   * @memberOf _
   * @category Util
   * @example
   *
   * var object = { 'user': 'fred' };
   *
   * _.noop(object) === undefined;
   * // => true
   */
  function noop() {
    // No operation performed.
  }

  /**
   * The base implementation of `_.property` without support for deep paths.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @returns {Function} Returns the new function.
   */
  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }

  /**
   * Gets the "length" property value of `object`.
   *
   * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
   * that affects Safari on at least iOS 8.1-8.3 ARM64.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {*} Returns the "length" value.
   */
  var getLength = baseProperty('length');

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
  }

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null &&
      !(typeof value == 'function' && isFunction(value)) && isLength(getLength(value));
  }

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Built-in value references. */
  var getPrototypeOf = Object.getPrototypeOf;

  /**
   * The base implementation of `_.has` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} key The key to check.
   * @returns {boolean} Returns `true` if `key` exists, else `false`.
   */
  function baseHas(object, key) {
    // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
    // that are composed entirely of index properties, return `false` for
    // `hasOwnProperty` checks of them.
    return hasOwnProperty.call(object, key) ||
      (typeof object == 'object' && key in object && getPrototypeOf(object) === null);
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys = Object.keys;

  /**
   * The base implementation of `_.keys` which doesn't skip the constructor
   * property of prototypes or treat sparse arrays as dense.
   *
   * @private
   * @type Function
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    return nativeKeys(Object(object));
  }

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * This method is like `_.isArrayLike` except that it also checks if `value`
   * is an object.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array-like object, else `false`.
   * @example
   *
   * _.isArrayLikeObject([1, 2, 3]);
   * // => true
   *
   * _.isArrayLikeObject(document.body.children);
   * // => true
   *
   * _.isArrayLikeObject('abc');
   * // => false
   *
   * _.isArrayLikeObject(_.noop);
   * // => false
   */
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]';

  /** Used for built-in method references. */
  var objectProto$2 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto$2.toString;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
    return isArrayLikeObject(value) && hasOwnProperty$1.call(value, 'callee') &&
      (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  /** `Object#toString` result references. */
  var stringTag = '[object String]';

  /** Used for built-in method references. */
  var objectProto$3 = Object.prototype;

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString$1 = objectProto$3.toString;

  /**
   * Checks if `value` is classified as a `String` primitive or object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isString('abc');
   * // => true
   *
   * _.isString(1);
   * // => false
   */
  function isString(value) {
    return typeof value == 'string' ||
      (!isArray(value) && isObjectLike(value) && objectToString$1.call(value) == stringTag);
  }

  /**
   * Creates an array of index keys for `object` values of arrays,
   * `arguments` objects, and strings, otherwise `null` is returned.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array|null} Returns index keys, else `null`.
   */
  function indexKeys(object) {
    var length = object ? object.length : undefined;
    if (isLength(length) &&
        (isArray(object) || isString(object) || isArguments(object))) {
      return baseTimes(length, String);
    }
    return null;
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return value > -1 && value % 1 == 0 && value < length;
  }

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$1;

    return value === proto;
  }

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    var isProto = isPrototype(object);
    if (!(isProto || isArrayLike(object))) {
      return baseKeys(object);
    }
    var indexes = indexKeys(object),
        skipIndexes = !!indexes,
        result = indexes || [],
        length = result.length;

    for (var key in object) {
      if (baseHas(object, key) &&
          !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
          !(isProto && key == 'constructor')) {
        result.push(key);
      }
    }
    return result;
  }

  function keyIterator(coll) {
      var i = -1;
      var len;
      if (isArrayLike(coll)) {
          len = coll.length;
          return function next() {
              i++;
              return i < len ? i : null;
          };
      } else {
          var okeys = keys(coll);
          len = okeys.length;
          return function next() {
              i++;
              return i < len ? okeys[i] : null;
          };
      }
  }

  function onlyOnce(fn) {
      return function () {
          if (fn === null) throw new Error("Callback was already called.");
          fn.apply(this, arguments);
          fn = null;
      };
  }

  function eachOf(object, iterator, callback) {
      callback = once(callback || noop);
      object = object || [];

      var iter = keyIterator(object);
      var key,
          completed = 0;

      while ((key = iter()) != null) {
          completed += 1;
          iterator(object[key], key, onlyOnce(done));
      }

      if (completed === 0) callback(null);

      function done(err) {
          completed--;
          if (err) {
              callback(err);
          }
          // Check key is null in case iterator isn't exhausted
          // and done resolved synchronously.
          else if (key === null && completed <= 0) {
                  callback(null);
              }
      }
  }

  var applyEach = applyEach$1(eachOf);

  var _setImmediate = typeof setImmediate === 'function' && setImmediate;

  var _delay;
  if (_setImmediate) {
      _delay = function (fn) {
          // not a direct alias for IE10 compatibility
          _setImmediate(fn);
      };
  } else if (typeof process === 'object' && typeof process.nextTick === 'function') {
      _delay = process.nextTick;
  } else {
      _delay = function (fn) {
          setTimeout(fn, 0);
      };
  }

  var setImmediate$1 = _delay;

  function eachOfSeries(obj, iterator, callback) {
      callback = once(callback || noop);
      obj = obj || [];
      var nextKey = keyIterator(obj);
      var key = nextKey();

      function iterate() {
          var sync = true;
          if (key === null) {
              return callback(null);
          }
          iterator(obj[key], key, onlyOnce(function (err) {
              if (err) {
                  callback(err);
              } else {
                  key = nextKey();
                  if (key === null) {
                      return callback(null);
                  } else {
                      if (sync) {
                          setImmediate$1(iterate);
                      } else {
                          iterate();
                      }
                  }
              }
          }));
          sync = false;
      }
      iterate();
  }

  var applyEachSeries = applyEach$1(eachOfSeries);

  var apply = rest(function (fn, args) {
      return rest(function (callArgs) {
          return fn.apply(null, args.concat(callArgs));
      });
  });

  function asyncify(func) {
      return rest(function (args) {
          var callback = args.pop();
          var result;
          try {
              result = func.apply(this, args);
          } catch (e) {
              return callback(e);
          }
          // if result is Promise object
          if (isObject(result) && typeof result.then === 'function') {
              result.then(function (value) {
                  callback(null, value);
              })['catch'](function (err) {
                  callback(err.message ? err : new Error(err));
              });
          } else {
              callback(null, result);
          }
      });
  }

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * A specialized version of `_.every` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if all elements pass the predicate check, else `false`.
   */
  function arrayEvery(array, predicate) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      if (!predicate(array[index], index, array)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Creates a base function for methods like `_.forIn`.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;

      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  /**
   * The base implementation of `baseForIn` and `baseForOwn` which iterates
   * over `object` properties returned by `keysFunc` invoking `iteratee` for
   * each property. Iteratee functions may exit iteration early by explicitly
   * returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @returns {Object} Returns `object`.
   */
  var baseFor = createBaseFor();

  /**
   * The base implementation of `_.forOwn` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }

  /**
   * This method returns the first argument given to it.
   *
   * @static
   * @memberOf _
   * @category Util
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'user': 'fred' };
   *
   * _.identity(object) === object;
   * // => true
   */
  function identity(value) {
    return value;
  }

  /**
   * Converts `value` to a function if it's not one.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {Function} Returns the function.
   */
  function toFunction(value) {
    return typeof value == 'function' ? value : identity;
  }

  /**
   * Iterates over own enumerable properties of an object invoking `iteratee`
   * for each property. The iteratee is invoked with three arguments:
   * (value, key, object). Iteratee functions may exit iteration early by
   * explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @returns {Object} Returns `object`.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.forOwn(new Foo, function(value, key) {
   *   console.log(key);
   * });
   * // => logs 'a' then 'b' (iteration order is not guaranteed)
   */
  function forOwn(object, iteratee) {
    return object && baseForOwn(object, toFunction(iteratee));
  }

  /**
   * Gets the index at which the first occurrence of `NaN` is found in `array`.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {number} fromIndex The index to search from.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched `NaN`, else `-1`.
   */
  function indexOfNaN(array, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 0 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      var other = array[index];
      if (other !== other) {
        return index;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    if (value !== value) {
      return indexOfNaN(array, fromIndex);
    }
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax$1 = Math.max;

  /**
   * Gets the index at which the first occurrence of `value` is found in `array`
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * for equality comparisons. If `fromIndex` is negative, it's used as the offset
   * from the end of `array`.
   *
   * @static
   * @memberOf _
   * @category Array
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   * @example
   *
   * _.indexOf([1, 2, 1, 2], 2);
   * // => 1
   *
   * // Search from the `fromIndex`.
   * _.indexOf([1, 2, 1, 2], 2, 2);
   * // => 3
   */
  function indexOf(array, value, fromIndex) {
    var length = array ? array.length : 0;
    if (!length) {
      return -1;
    }
    fromIndex = toInteger(fromIndex);
    if (fromIndex < 0) {
      fromIndex = nativeMax$1(length + fromIndex, 0);
    }
    return baseIndexOf(array, value, fromIndex);
  }

  function auto (tasks, concurrency, callback) {
      if (typeof arguments[1] === 'function') {
          // concurrency is optional, shift the args.
          callback = concurrency;
          concurrency = null;
      }
      callback = once(callback || noop);
      var keys$$ = keys(tasks);
      var remainingTasks = keys$$.length;
      if (!remainingTasks) {
          return callback(null);
      }
      if (!concurrency) {
          concurrency = remainingTasks;
      }

      var results = {};
      var runningTasks = 0;
      var hasError = false;

      var listeners = [];
      function addListener(fn) {
          listeners.unshift(fn);
      }
      function removeListener(fn) {
          var idx = indexOf(listeners, fn);
          if (idx >= 0) listeners.splice(idx, 1);
      }
      function taskComplete() {
          remainingTasks--;
          arrayEach(listeners.slice(), function (fn) {
              fn();
          });
      }

      addListener(function () {
          if (!remainingTasks) {
              callback(null, results);
          }
      });

      arrayEach(keys$$, function (k) {
          if (hasError) return;
          var task = isArray(tasks[k]) ? tasks[k] : [tasks[k]];
          var taskCallback = rest(function (err, args) {
              runningTasks--;
              if (args.length <= 1) {
                  args = args[0];
              }
              if (err) {
                  var safeResults = {};
                  forOwn(results, function (val, rkey) {
                      safeResults[rkey] = val;
                  });
                  safeResults[k] = args;
                  hasError = true;

                  callback(err, safeResults);
              } else {
                  results[k] = args;
                  setImmediate$1(taskComplete);
              }
          });
          var requires = task.slice(0, task.length - 1);
          // prevent dead-locks
          var len = requires.length;
          var dep;
          while (len--) {
              if (!(dep = tasks[requires[len]])) {
                  throw new Error('Has non-existent dependency in ' + requires.join(', '));
              }
              if (isArray(dep) && indexOf(dep, k) >= 0) {
                  throw new Error('Has cyclic dependencies');
              }
          }
          function ready() {
              return runningTasks < concurrency && !baseHas(results, k) && arrayEvery(requires, function (x) {
                  return baseHas(results, x);
              });
          }
          if (ready()) {
              runningTasks++;
              task[task.length - 1](taskCallback, results);
          } else {
              addListener(listener);
          }
          function listener() {
              if (ready()) {
                  runningTasks++;
                  removeListener(listener);
                  task[task.length - 1](taskCallback, results);
              }
          }
      });
  }

  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function arrayMap(array, iteratee) {
    var index = -1,
        length = array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  function queue$1(worker, concurrency, payload) {
      if (concurrency == null) {
          concurrency = 1;
      } else if (concurrency === 0) {
          throw new Error('Concurrency must not be zero');
      }
      function _insert(q, data, pos, callback) {
          if (callback != null && typeof callback !== 'function') {
              throw new Error('task callback must be a function');
          }
          q.started = true;
          if (!isArray(data)) {
              data = [data];
          }
          if (data.length === 0 && q.idle()) {
              // call drain immediately if there are no tasks
              return setImmediate$1(function () {
                  q.drain();
              });
          }
          arrayEach(data, function (task) {
              var item = {
                  data: task,
                  callback: callback || noop
              };

              if (pos) {
                  q.tasks.unshift(item);
              } else {
                  q.tasks.push(item);
              }

              if (q.tasks.length === q.concurrency) {
                  q.saturated();
              }
          });
          setImmediate$1(q.process);
      }
      function _next(q, tasks) {
          return function () {
              workers -= 1;

              var removed = false;
              var args = arguments;
              arrayEach(tasks, function (task) {
                  arrayEach(workersList, function (worker, index) {
                      if (worker === task && !removed) {
                          workersList.splice(index, 1);
                          removed = true;
                      }
                  });

                  task.callback.apply(task, args);
              });
              if (q.tasks.length + workers === 0) {
                  q.drain();
              }
              q.process();
          };
      }

      var workers = 0;
      var workersList = [];
      var q = {
          tasks: [],
          concurrency: concurrency,
          payload: payload,
          saturated: noop,
          empty: noop,
          drain: noop,
          started: false,
          paused: false,
          push: function (data, callback) {
              _insert(q, data, false, callback);
          },
          kill: function () {
              q.drain = noop;
              q.tasks = [];
          },
          unshift: function (data, callback) {
              _insert(q, data, true, callback);
          },
          process: function () {
              while (!q.paused && workers < q.concurrency && q.tasks.length) {

                  var tasks = q.payload ? q.tasks.splice(0, q.payload) : q.tasks.splice(0, q.tasks.length);

                  var data = arrayMap(tasks, baseProperty('data'));

                  if (q.tasks.length === 0) {
                      q.empty();
                  }
                  workers += 1;
                  workersList.push(tasks[0]);
                  var cb = onlyOnce(_next(q, tasks));
                  worker(data, cb);
              }
          },
          length: function () {
              return q.tasks.length;
          },
          running: function () {
              return workers;
          },
          workersList: function () {
              return workersList;
          },
          idle: function () {
              return q.tasks.length + workers === 0;
          },
          pause: function () {
              q.paused = true;
          },
          resume: function () {
              if (q.paused === false) {
                  return;
              }
              q.paused = false;
              var resumeCount = Math.min(q.concurrency, q.tasks.length);
              // Need to call q.process once per concurrent
              // worker to preserve full concurrency after pause
              for (var w = 1; w <= resumeCount; w++) {
                  setImmediate$1(q.process);
              }
          }
      };
      return q;
  }

  function cargo(worker, payload) {
      return queue$1(worker, 1, payload);
  }

  function reduce(arr, memo, iterator, cb) {
      eachOfSeries(arr, function (x, i, cb) {
          iterator(memo, x, function (err, v) {
              memo = v;
              cb(err);
          });
      }, function (err) {
          cb(err, memo);
      });
  }

  function seq() /* functions... */{
      var fns = arguments;
      return rest(function (args) {
          var that = this;

          var cb = args[args.length - 1];
          if (typeof cb == 'function') {
              args.pop();
          } else {
              cb = noop;
          }

          reduce(fns, args, function (newargs, fn, cb) {
              fn.apply(that, newargs.concat([rest(function (err, nextargs) {
                  cb(err, nextargs);
              })]));
          }, function (err, results) {
              cb.apply(that, [err].concat(results));
          });
      });
  }

  var reverse = Array.prototype.reverse;

  function compose() /* functions... */{
      return seq.apply(null, reverse.call(arguments));
  }

  function concat$1(eachfn, arr, fn, callback) {
      var result = [];
      eachfn(arr, function (x, index, cb) {
          fn(x, function (err, y) {
              result = result.concat(y || []);
              cb(err);
          });
      }, function (err) {
          callback(err, result);
      });
  }

  function doParallel(fn) {
      return function (obj, iterator, callback) {
          return fn(eachOf, obj, iterator, callback);
      };
  }

  var concat = doParallel(concat$1);

  function doSeries(fn) {
      return function (obj, iterator, callback) {
          return fn(eachOfSeries, obj, iterator, callback);
      };
  }

  var concatSeries = doSeries(concat$1);

  var constant = rest(function (values) {
      var args = [null].concat(values);
      return function (cb) {
          return cb.apply(this, args);
      };
  });

  function _createTester(eachfn, check, getResult) {
      return function (arr, limit, iterator, cb) {
          function done(err) {
              if (cb) {
                  if (err) {
                      cb(err);
                  } else {
                      cb(null, getResult(false, void 0));
                  }
              }
          }
          function iteratee(x, _, callback) {
              if (!cb) return callback();
              iterator(x, function (err, v) {
                  if (cb) {
                      if (err) {
                          cb(err);
                          cb = iterator = false;
                      } else if (check(v)) {
                          cb(null, getResult(true, x));
                          cb = iterator = false;
                      }
                  }
                  callback();
              });
          }
          if (arguments.length > 3) {
              eachfn(arr, limit, iteratee, done);
          } else {
              cb = iterator;
              iterator = limit;
              eachfn(arr, iteratee, done);
          }
      };
  }

  function _findGetResult(v, x) {
      return x;
  }

  var detect = _createTester(eachOf, identity, _findGetResult);

  function _eachOfLimit(limit) {
      return function (obj, iterator, callback) {
          callback = once(callback || noop);
          obj = obj || [];
          var nextKey = keyIterator(obj);
          if (limit <= 0) {
              return callback(null);
          }
          var done = false;
          var running = 0;
          var errored = false;

          (function replenish() {
              if (done && running <= 0) {
                  return callback(null);
              }

              while (running < limit && !errored) {
                  var key = nextKey();
                  if (key === null) {
                      done = true;
                      if (running <= 0) {
                          callback(null);
                      }
                      return;
                  }
                  running += 1;
                  iterator(obj[key], key, onlyOnce(function (err) {
                      running -= 1;
                      if (err) {
                          callback(err);
                          errored = true;
                      } else {
                          replenish();
                      }
                  }));
              }
          })();
      };
  }

  function eachOfLimit(obj, limit, iterator, cb) {
      _eachOfLimit(limit)(obj, iterator, cb);
  }

  var detectLimit = _createTester(eachOfLimit, identity, _findGetResult);

  var detectSeries = _createTester(eachOfSeries, identity, _findGetResult);

  function consoleFunc(name) {
      return rest(function (fn, args) {
          fn.apply(null, args.concat([rest(function (err, args) {
              if (typeof console === 'object') {
                  if (err) {
                      if (console.error) {
                          console.error(err);
                      }
                  } else if (console[name]) {
                      arrayEach(args, function (x) {
                          console[name](x);
                      });
                  }
              }
          })]));
      });
  }

  var dir = consoleFunc('dir');

  function during(test, iterator, cb) {
      cb = cb || noop;

      var next = rest(function (err, args) {
          if (err) {
              cb(err);
          } else {
              args.push(check);
              test.apply(this, args);
          }
      });

      var check = function (err, truth) {
          if (err) return cb(err);
          if (!truth) return cb(null);
          iterator(next);
      };

      test(check);
  }

  function doDuring(iterator, test, cb) {
      var calls = 0;

      during(function (next) {
          if (calls++ < 1) return next(null, true);
          test.apply(this, arguments);
      }, iterator, cb);
  }

  function whilst(test, iterator, cb) {
      cb = cb || noop;
      if (!test()) return cb(null);
      var next = rest(function (err, args) {
          if (err) return cb(err);
          if (test.apply(this, args)) return iterator(next);
          cb.apply(null, [null].concat(args));
      });
      iterator(next);
  }

  function doWhilst(iterator, test, cb) {
      var calls = 0;
      return whilst(function () {
          return ++calls <= 1 || test.apply(this, arguments);
      }, iterator, cb);
  }

  function doUntil(iterator, test, cb) {
      return doWhilst(iterator, function () {
          return !test.apply(this, arguments);
      }, cb);
  }

  function _withoutIndex(iterator) {
      return function (value, index, callback) {
          return iterator(value, callback);
      };
  }

  function each(arr, iterator, cb) {
      return eachOf(arr, _withoutIndex(iterator), cb);
  }

  function eachLimit(arr, limit, iterator, cb) {
      return _eachOfLimit(limit)(arr, _withoutIndex(iterator), cb);
  }

  function eachSeries(arr, iterator, cb) {
      return eachOfSeries(arr, _withoutIndex(iterator), cb);
  }

  function ensureAsync(fn) {
      return rest(function (args) {
          var callback = args.pop();
          var sync = true;
          args.push(function () {
              var innerArgs = arguments;
              if (sync) {
                  setImmediate$1(function () {
                      callback.apply(null, innerArgs);
                  });
              } else {
                  callback.apply(null, innerArgs);
              }
          });
          fn.apply(this, args);
          sync = false;
      });
  }

  function notId(v) {
      return !v;
  }

  var every = _createTester(eachOf, notId, notId);

  var everyLimit = _createTester(eachOfLimit, notId, notId);

  function _filter(eachfn, arr, iterator, callback) {
      var results = [];
      eachfn(arr, function (x, index, callback) {
          iterator(x, function (err, v) {
              if (err) {
                  callback(err);
              } else {
                  if (v) {
                      results.push({ index: index, value: x });
                  }
                  callback();
              }
          });
      }, function (err) {
          if (err) {
              callback(err);
          } else {
              callback(null, arrayMap(results.sort(function (a, b) {
                  return a.index - b.index;
              }), baseProperty('value')));
          }
      });
  }

  var filter = doParallel(_filter);

  function doParallelLimit(fn) {
      return function (obj, limit, iterator, callback) {
          return fn(_eachOfLimit(limit), obj, iterator, callback);
      };
  }

  var filterLimit = doParallelLimit(_filter);

  var filterSeries = doSeries(_filter);

  function forever(fn, cb) {
      var done = onlyOnce(cb || noop);
      var task = ensureAsync(fn);

      function next(err) {
          if (err) return done(err);
          task(next);
      }
      next();
  }

  function iterator (tasks) {
      function makeCallback(index) {
          function fn() {
              if (tasks.length) {
                  tasks[index].apply(null, arguments);
              }
              return fn.next();
          }
          fn.next = function () {
              return index < tasks.length - 1 ? makeCallback(index + 1) : null;
          };
          return fn;
      }
      return makeCallback(0);
  }

  var log = consoleFunc('log');

  function _asyncMap(eachfn, arr, iterator, callback) {
      callback = once(callback || noop);
      arr = arr || [];
      var results = isArrayLike(arr) ? [] : {};
      eachfn(arr, function (value, index, callback) {
          iterator(value, function (err, v) {
              results[index] = v;
              callback(err);
          });
      }, function (err) {
          callback(err, results);
      });
  }

  var map = doParallel(_asyncMap);

  var mapLimit = doParallelLimit(_asyncMap);

  var mapSeries = doSeries(_asyncMap);

  /**
   * Checks if `value` is a global object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {null|Object} Returns `value` if it's a global object, else `null`.
   */
  function checkGlobal(value) {
    return (value && value.Object === Object) ? value : null;
  }

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Detect free variable `exports`. */
  var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType) ? exports : null;

  /** Detect free variable `module`. */
  var freeModule = (objectTypes[typeof module] && module && !module.nodeType) ? module : null;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

  /** Detect free variable `self`. */
  var freeSelf = checkGlobal(objectTypes[typeof self] && self);

  /** Detect free variable `window`. */
  var freeWindow = checkGlobal(objectTypes[typeof window] && window);

  /** Detect `this` as the global object. */
  var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

  /**
   * Used as a reference to the global object.
   *
   * The `this` value is used if it's the global object to avoid Greasemonkey's
   * restricted `window` object, otherwise the `window` object is used.
   */
  var root = freeGlobal || ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) || freeSelf || thisGlobal || Function('return this')();

  /** Built-in value references. */
  var Symbol = root.Symbol;

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype;

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString$3 = objectProto$5.toString;

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && objectToString$3.call(value) == symbolTag);
  }

  /** Used as references for various `Number` constants. */
  var INFINITY$1 = 1 / 0;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol ? Symbol.prototype : undefined;
  var symbolToString = Symbol ? symbolProto.toString : undefined;
  /**
   * Converts `value` to a string if it's not one. An empty string is returned
   * for `null` and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (value == null) {
      return '';
    }
    if (isSymbol(value)) {
      return Symbol ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
  }

  /** Used to match property names within property paths. */
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g;

  /** Used to match backslashes in property paths. */
  var reEscapeChar = /\\(\\)?/g;

  /**
   * Converts `string` to a property path array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the property path array.
   */
  function stringToPath(string) {
    var result = [];
    toString(string).replace(rePropName, function(match, number, quote, string) {
      result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
    });
    return result;
  }

  /**
   * The base implementation of `_.toPath` which only converts `value` to a
   * path if it's not one.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {Array} Returns the property path array.
   */
  function baseToPath(value) {
    return isArray(value) ? value : stringToPath(value);
  }

  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp = /^\w*$/;
  /**
   * Checks if `value` is a property name and not a property path.
   *
   * @private
   * @param {*} value The value to check.
   * @param {Object} [object] The object to query keys on.
   * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
   */
  function isKey(value, object) {
    if (typeof value == 'number') {
      return true;
    }
    return !isArray(value) &&
      (reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object)));
  }

  /**
   * Gets the last element of `array`.
   *
   * @static
   * @memberOf _
   * @category Array
   * @param {Array} array The array to query.
   * @returns {*} Returns the last element of `array`.
   * @example
   *
   * _.last([1, 2, 3]);
   * // => 3
   */
  function last(array) {
    var length = array ? array.length : 0;
    return length ? array[length - 1] : undefined;
  }

  /**
   * The base implementation of `_.slice` without an iteratee call guard.
   *
   * @private
   * @param {Array} array The array to slice.
   * @param {number} [start=0] The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns the slice of `array`.
   */
  function baseSlice(array, start, end) {
    var index = -1,
        length = array.length;

    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    end = end > length ? length : end;
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;

    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }

  /**
   * The base implementation of `_.get` without support for default values.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to get.
   * @returns {*} Returns the resolved value.
   */
  function baseGet(object, path) {
    path = isKey(path, object) ? [path + ''] : baseToPath(path);

    var index = 0,
        length = path.length;

    while (object != null && index < length) {
      object = object[path[index++]];
    }
    return (index && index == length) ? object : undefined;
  }

  /**
   * Gets the value at `path` of `object`. If the resolved value is
   * `undefined` the `defaultValue` is used in its place.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to get.
   * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
   * @returns {*} Returns the resolved value.
   * @example
   *
   * var object = { 'a': [{ 'b': { 'c': 3 } }] };
   *
   * _.get(object, 'a[0].b.c');
   * // => 3
   *
   * _.get(object, ['a', '0', 'b', 'c']);
   * // => 3
   *
   * _.get(object, 'a.b.c', 'default');
   * // => 'default'
   */
  function get(object, path, defaultValue) {
    var result = object == null ? undefined : baseGet(object, path);
    return result === undefined ? defaultValue : result;
  }

  /**
   * Gets the parent value at `path` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} path The path to get the parent value of.
   * @returns {*} Returns the parent value.
   */
  function parent(object, path) {
    return path.length == 1 ? object : get(object, baseSlice(path, 0, -1));
  }

  /**
   * Checks if `path` exists on `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @param {Function} hasFunc The function to check properties.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   */
  function hasPath(object, path, hasFunc) {
    if (object == null) {
      return false;
    }
    var result = hasFunc(object, path);
    if (!result && !isKey(path)) {
      path = baseToPath(path);
      object = parent(object, path);
      if (object != null) {
        path = last(path);
        result = hasFunc(object, path);
      }
    }
    var length = object ? object.length : undefined;
    return result || (
      !!length && isLength(length) && isIndex(path, length) &&
      (isArray(object) || isString(object) || isArguments(object))
    );
  }

  /**
   * Checks if `path` is a direct property of `object`.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   * @example
   *
   * var object = { 'a': { 'b': { 'c': 3 } } };
   * var other = _.create({ 'a': _.create({ 'b': _.create({ 'c': 3 }) }) });
   *
   * _.has(object, 'a');
   * // => true
   *
   * _.has(object, 'a.b.c');
   * // => true
   *
   * _.has(object, ['a', 'b', 'c']);
   * // => true
   *
   * _.has(other, 'a');
   * // => false
   */
  function has(object, path) {
    return hasPath(object, path, baseHas);
  }

  function memoize(fn, hasher) {
      var memo = Object.create(null);
      var queues = Object.create(null);
      hasher = hasher || identity;
      var memoized = rest(function memoized(args) {
          var callback = args.pop();
          var key = hasher.apply(null, args);
          if (has(memo, key)) {
              setImmediate$1(function () {
                  callback.apply(null, memo[key]);
              });
          } else if (has(queues, key)) {
              queues[key].push(callback);
          } else {
              queues[key] = [callback];
              fn.apply(null, args.concat([rest(function (args) {
                  memo[key] = args;
                  var q = queues[key];
                  delete queues[key];
                  for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, args);
                  }
              })]));
          }
      });
      memoized.memo = memo;
      memoized.unmemoized = fn;
      return memoized;
  }

  var nexTick = typeof process === 'object' && typeof process.nextTick === 'function' ? process.nextTick : setImmediate$1;

  function _parallel(eachfn, tasks, callback) {
      callback = callback || noop;
      var results = isArrayLike(tasks) ? [] : {};

      eachfn(tasks, function (task, key, callback) {
          task(rest(function (err, args) {
              if (args.length <= 1) {
                  args = args[0];
              }
              results[key] = args;
              callback(err);
          }));
      }, function (err) {
          callback(err, results);
      });
  }

  function parallel(tasks, cb) {
      return _parallel(eachOf, tasks, cb);
  }

  function parallelLimit(tasks, limit, cb) {
      return _parallel(_eachOfLimit(limit), tasks, cb);
  }

  function queue (worker, concurrency) {
      return queue$1(function (items, cb) {
          worker(items[0], cb);
      }, concurrency, 1);
  }

  function priorityQueue (worker, concurrency) {
      function _compareTasks(a, b) {
          return a.priority - b.priority;
      }

      function _binarySearch(sequence, item, compare) {
          var beg = -1,
              end = sequence.length - 1;
          while (beg < end) {
              var mid = beg + (end - beg + 1 >>> 1);
              if (compare(item, sequence[mid]) >= 0) {
                  beg = mid;
              } else {
                  end = mid - 1;
              }
          }
          return beg;
      }

      function _insert(q, data, priority, callback) {
          if (callback != null && typeof callback !== 'function') {
              throw new Error('task callback must be a function');
          }
          q.started = true;
          if (!isArray(data)) {
              data = [data];
          }
          if (data.length === 0) {
              // call drain immediately if there are no tasks
              return setImmediate$1(function () {
                  q.drain();
              });
          }
          arrayEach(data, function (task) {
              var item = {
                  data: task,
                  priority: priority,
                  callback: typeof callback === 'function' ? callback : noop
              };

              q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

              if (q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              setImmediate$1(q.process);
          });
      }

      // Start with a normal queue
      var q = queue(worker, concurrency);

      // Override push to accept second parameter representing priority
      q.push = function (data, priority, callback) {
          _insert(q, data, priority, callback);
      };

      // Remove unshift function
      delete q.unshift;

      return q;
  }

  var slice = Array.prototype.slice;

  function reduceRight(arr, memo, iterator, cb) {
      var reversed = slice.call(arr).reverse();
      reduce(reversed, memo, iterator, cb);
  }

  function reject$1(eachfn, arr, iterator, callback) {
      _filter(eachfn, arr, function (value, cb) {
          iterator(value, function (err, v) {
              if (err) {
                  cb(err);
              } else {
                  cb(null, !v);
              }
          });
      }, callback);
  }

  var reject = doParallel(reject$1);

  var rejectLimit = doParallelLimit(reject$1);

  var rejectSeries = doSeries(reject$1);

  function series(tasks, cb) {
      return _parallel(eachOfSeries, tasks, cb);
  }

  function retry(times, task, callback) {
      var DEFAULT_TIMES = 5;
      var DEFAULT_INTERVAL = 0;

      var attempts = [];

      var opts = {
          times: DEFAULT_TIMES,
          interval: DEFAULT_INTERVAL
      };

      function parseTimes(acc, t) {
          if (typeof t === 'number') {
              acc.times = parseInt(t, 10) || DEFAULT_TIMES;
          } else if (typeof t === 'object') {
              acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
              acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
          } else {
              throw new Error('Unsupported argument type for \'times\': ' + typeof t);
          }
      }

      var length = arguments.length;
      if (length < 1 || length > 3) {
          throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
      } else if (length <= 2 && typeof times === 'function') {
          callback = task;
          task = times;
      }
      if (typeof times !== 'function') {
          parseTimes(opts, times);
      }
      opts.callback = callback;
      opts.task = task;

      function wrappedTask(wrappedCallback, wrappedResults) {
          function retryAttempt(task, finalAttempt) {
              return function (seriesCallback) {
                  task(function (err, result) {
                      seriesCallback(!err || finalAttempt, {
                          err: err,
                          result: result
                      });
                  }, wrappedResults);
              };
          }

          function retryInterval(interval) {
              return function (seriesCallback) {
                  setTimeout(function () {
                      seriesCallback(null);
                  }, interval);
              };
          }

          while (opts.times) {

              var finalAttempt = !(opts.times -= 1);
              attempts.push(retryAttempt(opts.task, finalAttempt));
              if (!finalAttempt && opts.interval > 0) {
                  attempts.push(retryInterval(opts.interval));
              }
          }

          series(attempts, function (done, data) {
              data = data[data.length - 1];
              (wrappedCallback || opts.callback)(data.err, data.result);
          });
      }

      // If a callback is passed, run this as a controll flow
      return opts.callback ? wrappedTask() : wrappedTask;
  }

  var some = _createTester(eachOf, Boolean, identity);

  var someLimit = _createTester(eachOfLimit, Boolean, identity);

  function sortBy(arr, iterator, cb) {
      map(arr, function (x, cb) {
          iterator(x, function (err, criteria) {
              if (err) return cb(err);
              cb(null, { value: x, criteria: criteria });
          });
      }, function (err, results) {
          if (err) return cb(err);
          cb(null, arrayMap(results.sort(comparator), baseProperty('value')));
      });

      function comparator(left, right) {
          var a = left.criteria,
              b = right.criteria;
          return a < b ? -1 : a > b ? 1 : 0;
      }
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeCeil = Math.ceil;
  var nativeMax$2 = Math.max;
  /**
   * The base implementation of `_.range` and `_.rangeRight` which doesn't
   * coerce arguments to numbers.
   *
   * @private
   * @param {number} start The start of the range.
   * @param {number} end The end of the range.
   * @param {number} step The value to increment or decrement by.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Array} Returns the new array of numbers.
   */
  function baseRange(start, end, step, fromRight) {
    var index = -1,
        length = nativeMax$2(nativeCeil((end - start) / (step || 1)), 0),
        result = Array(length);

    while (length--) {
      result[fromRight ? length : ++index] = start;
      start += step;
    }
    return result;
  }

  function times (count, iterator, callback) {
      map(baseRange(0, count, 1), iterator, callback);
  }

  function timeLimit(count, limit, iterator, cb) {
      return mapLimit(baseRange(0, count, 1), limit, iterator, cb);
  }

  function timesSeries (count, iterator, callback) {
      mapSeries(baseRange(0, count, 1), iterator, callback);
  }

  function transform(arr, memo, iterator, callback) {
      if (arguments.length === 3) {
          callback = iterator;
          iterator = memo;
          memo = isArray(arr) ? [] : {};
      }

      eachOf(arr, function (v, k, cb) {
          iterator(memo, v, k, cb);
      }, function (err) {
          callback(err, memo);
      });
  }

  function unmemoize(fn) {
      return function () {
          return (fn.unmemoized || fn).apply(null, arguments);
      };
  }

  function until(test, iterator, cb) {
      return whilst(function () {
          return !test.apply(this, arguments);
      }, iterator, cb);
  }

  function waterfall (tasks, cb) {
      cb = once(cb || noop);
      if (!isArray(tasks)) return cb(new Error('First argument to waterfall must be an array of functions'));
      if (!tasks.length) return cb();

      function wrapIterator(iterator) {
          return rest(function (err, args) {
              if (err) {
                  cb.apply(null, [err].concat(args));
              } else {
                  var next = iterator.next();
                  if (next) {
                      args.push(wrapIterator(next));
                  } else {
                      args.push(cb);
                  }
                  ensureAsync(iterator).apply(null, args);
              }
          });
      }
      wrapIterator(iterator(tasks))();
  }

  var index = {
      applyEach: applyEach,
      applyEachSeries: applyEachSeries,
      apply: apply,
      asyncify: asyncify,
      auto: auto,
      cargo: cargo,
      compose: compose,
      concat: concat,
      concatSeries: concatSeries,
      constant: constant,
      detect: detect,
      detectLimit: detectLimit,
      detectSeries: detectSeries,
      dir: dir,
      doDuring: doDuring,
      doUntil: doUntil,
      doWhilst: doWhilst,
      during: during,
      each: each,
      eachLimit: eachLimit,
      eachOf: eachOf,
      eachOfLimit: eachOfLimit,
      eachOfSeries: eachOfSeries,
      eachSeries: eachSeries,
      ensureAsync: ensureAsync,
      every: every,
      everyLimit: everyLimit,
      filter: filter,
      filterLimit: filterLimit,
      filterSeries: filterSeries,
      forever: forever,
      iterator: iterator,
      log: log,
      map: map,
      mapLimit: mapLimit,
      mapSeries: mapSeries,
      memoize: memoize,
      nextTick: nexTick,
      parallel: parallel,
      parallelLimit: parallelLimit,
      priorityQueue: priorityQueue,
      queue: queue,
      reduce: reduce,
      reduceRight: reduceRight,
      reject: reject,
      rejectLimit: rejectLimit,
      rejectSeries: rejectSeries,
      retry: retry,
      seq: seq,
      series: series,
      setImmediate: setImmediate$1,
      some: some,
      someLimit: someLimit,
      sortBy: sortBy,
      times: times,
      timesLimit: timeLimit,
      timesSeries: timesSeries,
      transform: transform,
      unmemoize: unmemoize,
      until: until,
      waterfall: waterfall,
      whilst: whilst,

      // aliases
      all: every,
      any: some,
      forEach: each,
      forEachSeries: eachSeries,
      forEachLimit: eachLimit,
      forEachOf: eachOf,
      forEachOfSeries: eachOfSeries,
      forEachOfLimit: eachOfLimit,
      inject: reduce,
      foldl: reduce,
      foldr: reduceRight,
      select: filter,
      selectLimit: filterLimit,
      selectSeries: filterSeries,
      wrapSync: asyncify
  };

  exports['default'] = index;
  exports.applyEach = applyEach;
  exports.applyEachSeries = applyEachSeries;
  exports.apply = apply;
  exports.asyncify = asyncify;
  exports.auto = auto;
  exports.cargo = cargo;
  exports.compose = compose;
  exports.concat = concat;
  exports.concatSeries = concatSeries;
  exports.constant = constant;
  exports.detect = detect;
  exports.detectLimit = detectLimit;
  exports.detectSeries = detectSeries;
  exports.dir = dir;
  exports.doDuring = doDuring;
  exports.doUntil = doUntil;
  exports.doWhilst = doWhilst;
  exports.during = during;
  exports.each = each;
  exports.eachLimit = eachLimit;
  exports.eachOf = eachOf;
  exports.eachOfLimit = eachOfLimit;
  exports.eachOfSeries = eachOfSeries;
  exports.eachSeries = eachSeries;
  exports.ensureAsync = ensureAsync;
  exports.every = every;
  exports.everyLimit = everyLimit;
  exports.filter = filter;
  exports.filterLimit = filterLimit;
  exports.filterSeries = filterSeries;
  exports.forever = forever;
  exports.iterator = iterator;
  exports.log = log;
  exports.map = map;
  exports.mapLimit = mapLimit;
  exports.mapSeries = mapSeries;
  exports.memoize = memoize;
  exports.nextTick = nexTick;
  exports.parallel = parallel;
  exports.parallelLimit = parallelLimit;
  exports.priorityQueue = priorityQueue;
  exports.queue = queue;
  exports.reduce = reduce;
  exports.reduceRight = reduceRight;
  exports.reject = reject;
  exports.rejectLimit = rejectLimit;
  exports.rejectSeries = rejectSeries;
  exports.retry = retry;
  exports.seq = seq;
  exports.series = series;
  exports.setImmediate = setImmediate$1;
  exports.some = some;
  exports.someLimit = someLimit;
  exports.sortBy = sortBy;
  exports.times = times;
  exports.timesLimit = timeLimit;
  exports.timesSeries = timesSeries;
  exports.transform = transform;
  exports.unmemoize = unmemoize;
  exports.until = until;
  exports.waterfall = waterfall;
  exports.whilst = whilst;
  exports.all = every;
  exports.any = some;
  exports.forEach = each;
  exports.forEachSeries = eachSeries;
  exports.forEachLimit = eachLimit;
  exports.forEachOf = eachOf;
  exports.forEachOfSeries = eachOfSeries;
  exports.forEachOfLimit = eachOfLimit;
  exports.inject = reduce;
  exports.foldl = reduce;
  exports.foldr = reduceRight;
  exports.select = filter;
  exports.selectLimit = filterLimit;
  exports.selectSeries = filterSeries;
  exports.wrapSync = asyncify;

}));