(function( global, factory ) {

  if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = global.document ?
      factory(global, true) :
      function( w ) {
        if ( !w.document ) {
          throw new Error("Requires a window with a document");
        }
        return factory(w);
      };
  } else {
    factory(global);
  }

}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

"use strict";
var DateTimeFormats, DateTimeNames, ISOstr2date, LIB_CONFIG, NAMESPACE_EXP, UTCstr2date, compareObjects, dateStr2obj, dtwz, error, filterElement, flattenArray, floatLength, formatDate, func, getMaxMin, ignoreSubStr, isArr, isCollection, name, range, storage, stringifyCollection, timezoneOffset, toString, unicode, utf8_to_base64, __proc, __util,
  __slice = [].slice;

LIB_CONFIG = {
  name: "Ronin",
  version: "0.3.1"
};

__proc = (function(window) {
  var attach, batch, defineProp, hasOwnProp, objectTypes, settings, storage, toString;
  toString = {}.toString;
  settings = {
    validator: function() {
      return true;
    }
  };
  storage = {
    types: {}
  };

  /*
   * Fill the map object-types, and add methods to detect object-type.
   * 
   * @private
   * @method   objectTypes
   * @return   {Object}
   */
  objectTypes = function() {
    var type, types, _fn, _i, _len;
    types = "Boolean Number String Function Array Date RegExp Object".split(" ");
    _fn = function(type) {
      var handler, lc;
      storage.types["[object " + type + "]"] = lc = type.toLowerCase();
      if (type === "Number") {
        handler = function(target) {
          if (isNaN(target)) {
            return false;
          } else {
            return this.type(target) === lc;
          }
        };
      } else {
        handler = function(target) {
          return this.type(target) === lc;
        };
      }
      return storage.methods["is" + type] = handler;
    };
    for (_i = 0, _len = types.length; _i < _len; _i++) {
      type = types[_i];
      _fn(type);
    }
    return storage.types;
  };

  /*
   * 判断某个对象是否有自己的指定属性
   *
   * !!! 不能用 object.hasOwnProperty(prop) 这种方式，低版本 IE 不支持。
   *
   * @private
   * @method   hasOwnProp
   * @param    obj {Object}    Target object
   * @param    prop {String}   Property to be tested
   * @return   {Boolean}
   */
  hasOwnProp = function(obj, prop) {
    if (obj == null) {
      return false;
    } else {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
  };

  /*
   * 为指定 object 或 function 定义属性
   *
   * @private
   * @method   defineProp
   * @param    target {Object}
   * @return   {Boolean}
   */
  defineProp = function(target) {
    var error, prop, value;
    prop = "__" + (LIB_CONFIG.name.toLowerCase()) + "__";
    value = true;
    try {
      Object.defineProperty(target, prop, {
        __proto__: null,
        value: value
      });
    } catch (_error) {
      error = _error;
      target[prop] = value;
    }
    return true;
  };

  /*
   * 批量添加 method
   *
   * @private
   * @method  batch
   * @param   handlers {Object}   data of a method
   * @param   data {Object}       data of a module
   * @param   host {Object}       the host of methods to be added
   * @return
   */
  batch = function(handlers, data, host) {
    var methods;
    methods = storage.methods;
    if (methods.isArray(data) || (methods.isPlainObject(data) && !methods.isArray(data.handlers))) {
      methods.each(data, function(d) {
        return batch(d != null ? d.handlers : void 0, d, host);
      });
    } else if (methods.isPlainObject(data) && methods.isArray(data.handlers)) {
      methods.each(handlers, function(info) {
        return attach(info, data, host);
      });
    }
    return host;
  };

  /*
   * 构造 method
   *
   * @private
   * @method  attach
   * @param   set {Object}        data of a method
   * @param   data {Object}       data of a module
   * @param   host {Object}       the host of methods to be added
   * @return
   */
  attach = function(set, data, host) {
    var handler, method, methods, name, validator, validators, value, _i, _len;
    name = set.name;
    methods = storage.methods;
    if (set.expose !== false && !methods.isFunction(host[name])) {
      handler = set.handler;
      value = hasOwnProp(set, "value") ? set.value : data.value;
      validators = [
        set.validator, data.validator, settings.validator, function() {
          return true;
        }
      ];
      for (_i = 0, _len = validators.length; _i < _len; _i++) {
        validator = validators[_i];
        if (methods.isFunction(validator)) {
          break;
        }
      }
      method = function() {
        if (methods.isFunction(handler) && validator.apply(host, arguments) === true) {
          return handler.apply(host, arguments);
        } else {
          return value;
        }
      };
      host[name] = method;
    }
    return host;
  };
  storage.methods = {

    /*
     * 扩展指定对象
     * 
     * @method  mixin
     * @param   unspecified {Mixed}
     * @return  {Object}
     */
    mixin: function() {
      var args, clone, copy, copyIsArray, deep, i, length, name, opts, src, target;
      args = arguments;
      length = args.length;
      target = args[0] || {};
      i = 1;
      deep = false;
      if (this.type(target) === "boolean") {
        deep = target;
        target = args[1] || {};
        i = 2;
      }
      if (typeof target !== "object" && !this.isFunction(target)) {
        target = {};
      }
      if (length === 1) {
        target = this;
        i--;
      }
      while (i < length) {
        opts = args[i];
        if (opts != null) {
          for (name in opts) {
            copy = opts[name];
            src = target[name];
            if (copy === target) {
              continue;
            }
            if (deep && copy && (this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && this.isArray(src) ? src : [];
              } else {
                clone = src && this.isPlainObject(src) ? src : {};
              }
              target[name] = this.mixin(deep, clone, copy);
            } else if (copy !== void 0) {
              target[name] = copy;
            }
          }
        }
        i++;
      }
      return target;
    },

    /*
     * 遍历
     * 
     * @method  each
     * @param   object {Object/Array/Array-Like/Function/String}
     * @param   callback {Function}
     * @return  {Mixed}
     */
    each: function(object, callback) {
      var ele, index, name, value;
      if (this.isArray(object) || this.isArrayLike(object) || this.isString(object)) {
        index = 0;
        while (index < object.length) {
          ele = this.isString(object) ? object.charAt(index) : object[index];
          if (callback.apply(ele, [ele, index++, object]) === false) {
            break;
          }
        }
      } else if (this.isObject(object) || this.isFunction(object)) {
        for (name in object) {
          value = object[name];
          if (callback.apply(value, [value, name, object]) === false) {
            break;
          }
        }
      }
      return object;
    },

    /*
     * 获取对象类型
     * 
     * @method  type
     * @param   object {Mixed}
     * @return  {String}
     */
    type: function(object) {
      var result;
      if (arguments.length === 0) {
        result = null;
      } else {
        result = object == null ? String(object) : storage.types[toString.call(object)] || "object";
      }
      return result;
    },

    /*
     * 切割 Array-Like Object 片段
     *
     * @method   slice
     * @param    target {Array-Like}
     * @param    begin {Integer}
     * @param    end {Integer}
     * @return
     */
    slice: function(target, begin, end) {
      var args, result;
      if (target == null) {
        result = [];
      } else {
        end = Number(end);
        args = [Number(begin) || 0];
        if (arguments.length > 2 && !isNaN(end)) {
          args.push(end);
        }
        result = [].slice.apply(target, args);
      }
      return result;
    },

    /*
     * 判断某个对象是否有自己的指定属性
     *
     * @method   hasProp
     * @param    prop {String}   Property to be tested
     * @param    obj {Object}    Target object
     * @return   {Boolean}
     */
    hasProp: function(prop, obj) {
      return hasOwnProp.apply(this, [(arguments.length < 2 ? this : obj), prop]);
    },

    /*
     * 判断是否为 window 对象
     * 
     * @method  isWindow
     * @param   object {Mixed}
     * @return  {Boolean}
     */
    isWindow: function(object) {
      return object && this.isObject(object) && "setInterval" in object;
    },

    /*
     * 判断是否为 DOM 对象
     * 
     * @method  isElement
     * @param   object {Mixed}
     * @return  {Boolean}
     */
    isElement: function(object) {
      return object && this.isObject(object) && object.nodeType === 1;
    },

    /*
     * 判断是否为数字类型（字符串）
     * 
     * @method  isNumeric
     * @param   object {Mixed}
     * @return  {Boolean}
     */
    isNumeric: function(object) {
      return !this.isArray(object) && !isNaN(parseFloat(object)) && isFinite(object);
    },

    /*
     * Determine whether a number is an integer.
     *
     * @method  isInteger
     * @param   object {Mixed}
     * @return  {Boolean}
     */
    isInteger: function(object) {
      return this.isNumeric(object) && /^-?[1-9]\d*$/.test(object);
    },

    /*
     * 判断对象是否为纯粹的对象（由 {} 或 new Object 创建）
     * 
     * @method  isPlainObject
     * @param   object {Mixed}
     * @return  {Boolean}
     */
    isPlainObject: function(object) {
      var error, key;
      if (!object || !this.isObject(object) || object.nodeType || this.isWindow(object)) {
        return false;
      }
      try {
        if (object.constructor && !this.hasProp("constructor", object) && !this.hasProp("isPrototypeOf", object.constructor.prototype)) {
          return false;
        }
      } catch (_error) {
        error = _error;
        return false;
      }
      for (key in object) {
        key;
      }
      return key === void 0 || this.hasProp(key, object);
    },

    /*
     * Determin whether a variable is considered to be empty.
     *
     * A variable is considered empty if its value is or like:
     *  - null
     *  - undefined
     *  - ""
     *  - []
     *  - {}
     *
     * @method  isEmpty
     * @param   object {Mixed}
     * @return  {Boolean}
     *
     * refer: http://www.php.net/manual/en/function.empty.php
     */
    isEmpty: function(object) {
      var name, result;
      result = false;
      if ((object == null) || object === "") {
        result = true;
      } else if ((this.isArray(object) || this.isArrayLike(object)) && object.length === 0) {
        result = true;
      } else if (this.isObject(object)) {
        result = true;
        for (name in object) {
          result = false;
          break;
        }
      }
      return result;
    },

    /*
     * 是否为类数组对象
     *
     * 类数组对象（Array-Like Object）是指具备以下特征的对象：
     * -
     * 1. 不是数组（Array）
     * 2. 有自动增长的 length 属性
     * 3. 以从 0 开始的数字做属性名
     *
     * @method  isArrayLike
     * @param   object {Mixed}
     * @return  {Boolean}
     */
    isArrayLike: function(object) {
      var length, result;
      result = false;
      if (this.isObject(object) && !this.isWindow(object)) {
        length = object.length;
        if (object.nodeType === 1 && length || !this.isArray(object) && !this.isFunction(object) && (length === 0 || this.isNumber(length) && length > 0 && (length - 1) in object)) {
          result = true;
        }
      }
      return result;
    }
  };
  objectTypes();
  __proc = function(data, host) {
    return batch(data != null ? data.handlers : void 0, data, host != null ? host : {});
  };
  storage.methods.each(storage.methods, function(handler, name) {
    return __proc[name] = handler;
  });
  return __proc;
})(window);

toString = {}.toString;

NAMESPACE_EXP = /^[0-9A-Z_.]+[^_.]?$/i;

storage = {
  regexps: {
    date: {
      iso8601: /^(\d{4})\-(\d{2})\-(\d{2})(?:T(\d{2})\:(\d{2})\:(\d{2})(?:(?:\.)(\d{3}))?(Z|[+-]\d{2}\:\d{2})?)?$/
    },
    object: {
      array: /\[(.*)\]/,
      number: /(-?[0-9]+)/
    }
  },
  modules: {
    Core: {}
  }
};

storage.modules.Core.BuiltIn = {
  handlers: (function() {
    var _results;
    _results = [];
    for (name in __proc) {
      func = __proc[name];
      _results.push({
        name: name,
        handler: func
      });
    }
    return _results;
  })()
};


/*
 * Compare objects' values or references.
 * 
 * @private
 * @method  compareObjects
 * @param   base {Array/Object}
 * @param   target {Array/Object}
 * @param   strict {Boolean}
 * @param   connate {Boolean}
 * @return  {Boolean}
 */

compareObjects = function(base, target, strict, connate) {
  var isRun, plain, result;
  result = false;
  plain = this.isPlainObject(base);
  if ((plain || connate) && strict) {
    result = target === base;
  } else {
    if (plain) {
      isRun = compareObjects.apply(this, [this.keys(base), this.keys(target), false, true]);
    } else {
      isRun = target.length === base.length;
    }
    if (isRun) {
      this.each(base, (function(_this) {
        return function(n, i) {
          var illegalNums, n_str, t, t_str, t_type, type;
          type = _this.type(n);
          t = target[i];
          if (_this.inArray(type, ["string", "number", "boolean"] > -1)) {
            n_str = n + "";
            t_str = t + "";
            t_type = _this.type(t);
            illegalNums = ["NaN", "Infinity", "-Infinity"];
            if (type === "number" && (_this.inArray(n_str, illegalNums) > -1 || _this.inArray(t_str, illegalNums) > -1)) {
              return result = false;
            } else {
              return result = strict === true ? t === n : t_str === n_str;
            }
          } else if (_this.inArray(type, ["null", "undefined"]) > -1) {
            return result = t === n;
          } else if (_this.inArray(type, ["date", "regexp", "function"]) > -1) {
            return result = strict ? t === n : t.toString() === n.toString();
          } else if (_this.inArray(type, ["array", "object"]) > -1) {
            return result = compareObjects.apply(_this, [n, t, strict, connate]);
          }
        };
      })(this));
    }
  }
  return result;
};


/*
 * 将 Array、Object 转化为字符串
 * 
 * @private
 * @method  stringifyCollection
 * @param   collection {Array/Plain Object}
 * @return  {String}
 */

stringifyCollection = function(collection) {
  var ele, key, stack, val;
  if (this.isArray(collection)) {
    stack = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        ele = collection[_i];
        _results.push(this.stringify(ele));
      }
      return _results;
    }).call(this);
  } else {
    stack = (function() {
      var _results;
      _results = [];
      for (key in collection) {
        val = collection[key];
        _results.push("\"" + key + "\":" + (this.stringify(val)));
      }
      return _results;
    }).call(this);
  }
  return stack.join(",");
};

storage.modules.Core.Global = {
  handlers: [
    {

      /*
       * 扩充对象
       * 
       * @method   extend
       * @param    data {Plain Object/Array}
       * @param    host {Object}
       * @return   {Object}
       */
      name: "extend",
      handler: function(data, host) {
        return __proc(data, host != null ? host : this);
      }
    }, {

      /*
       * 别名
       * 
       * @method  alias
       * @param   name {String}
       * @return
       */
      name: "alias",
      handler: function(name) {
        if (this.isString(name)) {
          if (window[name] === void 0) {
            window[name] = this;
          }
        }
        return window[String(name)];
      }
    }, {

      /*
       * 更改 LIB_CONFIG.name
       * 
       * @method   mask
       * @param    guise {String}    New name for library
       * @return   {Boolean}
       */
      name: "mask",
      handler: function(guise) {
        var error, lib_name, result;
        if (this.hasProp(guise, window)) {
          if (window.console) {
            console.error("'" + guise + "' has existed as a property of Window object.");
          }
        } else {
          lib_name = this.__meta__.name;
          window[guise] = window[lib_name];
          try {
            result = delete window[lib_name];
          } catch (_error) {
            error = _error;
            window[lib_name] = void 0;
            result = true;
          }
          this.__meta__.name = guise;
        }
        return result;
      },
      validator: function(guise) {
        return this.isString(guise);
      },
      value: false
    }, {

      /*
       * Returns the namespace specified and creates it if it doesn't exist.
       * Be careful when naming packages.
       * Reserved words may work in some browsers and not others.
       *
       * @method  namespace
       * @param   [hostObj] {Object}      Host object namespace will be added to
       * @param   [ns_str_1] {String}     The first namespace string
       * @param   [ns_str_2] {String}     The second namespace string
       * @param   [ns_str_*] {String}     Numerous namespace string
       * @param   [isGlobal] {Boolean}    Whether set window as the host object
       * @return  {Object}                A reference to the last namespace object created
       */
      name: "namespace",
      handler: function() {
        var args, hostObj, ns;
        args = arguments;
        ns = {};
        hostObj = args[0];
        if (!this.isPlainObject(hostObj)) {
          hostObj = args[args.length - 1] === true ? window : this;
        }
        this.each(args, (function(_this) {
          return function(arg) {
            var obj;
            if (_this.isString(arg) && /^[0-9A-Z_.]+[^_.]?$/i.test(arg)) {
              obj = hostObj;
              _this.each(arg.split("."), function(part, idx, parts) {
                if (obj == null) {
                  return false;
                }
                if (!_this.hasProp(part, obj)) {
                  obj[part] = idx === parts.length - 1 ? null : {};
                }
                obj = obj[part];
                return true;
              });
              ns = obj;
            }
            return true;
          };
        })(this));
        return ns;
      }
    }, {

      /*
       * Compares two objects for equality.
       *
       * @method  equal
       * @param   base {Mixed}
       * @param   target {Mixed}
       * @param   strict {Boolean}    whether compares the two objects' references
       * @return  {Boolean}
       */
      name: "equal",
      handler: function(base, target, strict) {
        var baseType, connate, plain_b, result;
        result = false;
        baseType = this.type(base);
        if (this.type(target) === baseType) {
          plain_b = this.isPlainObject(base);
          if (plain_b && this.isPlainObject(target) || baseType !== "object") {
            connate = this.isArray(base);
            if (!plain_b && !connate) {
              base = [base];
              target = [target];
            }
            if (!this.isBoolean(strict)) {
              strict = false;
            }
            result = compareObjects.apply(this, [base, target, strict, connate]);
          }
        }
        return result;
      },
      validator: function() {
        return arguments.length > 1;
      },
      value: false
    }, {

      /*
       * Returns a random integer between min and max, inclusive.
       * If you only pass one argument, it will return a number between 0 and that number.
       *
       * @method  random
       * @param   min {Number}
       * @param   max {Number}
       * @return  {Number}
       */
      name: "random",
      handler: function(min, max) {
        if (max == null) {
          max = min;
          min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
      }
    }, {

      /*
       * 字符串化
       *
       * @method  stringify
       * @param   target {Variant}
       * @return  {String}
       */
      name: "stringify",
      handler: function(target) {
        var e, result;
        switch (this.type(target)) {
          case "object":
            result = this.isPlainObject(target) ? "{" + (stringifyCollection.call(this, target)) + "}" : result = "";
            break;
          case "array":
            result = "[" + (stringifyCollection.call(this, target)) + "]";
            break;
          case "function":
          case "date":
          case "regexp":
            result = target.toString();
            break;
          case "string":
            result = "\"" + target + "\"";
            break;
          default:
            try {
              result = String(target);
            } catch (_error) {
              e = _error;
              result = "";
            }
        }
        return result;
      }
    }
  ]
};

storage.modules.Core.Object = {
  handlers: [
    {

      /*
       * Get a set of keys/indexes.
       * It will return a key or an index when pass the 'value' parameter.
       *
       * @method  keys
       * @param   object {Object/Function}    被操作的目标
       * @param   value {Mixed}               指定值
       * @return  {Array/String}
       *
       * refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
       */
      name: "keys",
      handler: function(object, value) {
        var keys;
        keys = [];
        this.each(object, function(v, k) {
          if (v === value) {
            keys = k;
            return false;
          } else {
            return keys.push(k);
          }
        });
        if (this.isArray(keys)) {
          return keys.sort();
        } else {
          return keys;
        }
      },
      validator: function(object) {
        var _ref;
        return object !== null && !(object instanceof Array) && ((_ref = typeof object) === "object" || _ref === "function");
      },
      value: []
    }
  ]
};


/*
 * Determine whether an object is an array.
 *
 * @private
 * @method  isCollection
 * @param   target {Array/Object}
 * @return  {Boolean}
 */

isArr = function(object) {
  return object instanceof Array;
};


/*
 * Determine whether an object is an array or a plain object.
 *
 * @private
 * @method  isCollection
 * @param   target {Array/Object}
 * @return  {Boolean}
 */

isCollection = function(target) {
  return this.isArray(target) || this.isPlainObject(target);
};


/*
 * Return the maximum (or the minimum) element (or element-based computation).
 * Can't optimize arrays of integers longer than 65,535 elements.
 * See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
 *
 * @private
 * @method  getMaxMin
 * @param   initialValue {Number}       Default return value of function
 * @param   funcName {String}           Method's name of Math object
 * @param   collection {Array/Object}   A collection to be manipulated
 * @param   callback {Function}         Callback for every element of the collection
 * @param   [context] {Mixed}           Context of the callback
 * @return  {Number}
 */

getMaxMin = function(initialValue, funcName, collection, callback, context) {
  var existCallback, result;
  result = {
    value: initialValue,
    computed: initialValue
  };
  if (isCollection.call(this, collection)) {
    existCallback = this.isFunction(callback);
    if (!existCallback && this.isArray(collection) && collection[0] === +collection[0] && collection.length < 65535) {
      return Math[funcName].apply(Math, collection);
    }
    this.each(collection, function(val, idx, list) {
      var computed;
      computed = existCallback ? callback.apply(context, [val, idx, list]) : val;
      if (funcName === "max" && computed > result.computed || funcName === "min" && computed < result.computed) {
        return result = {
          value: val,
          computed: computed
        };
      }
    });
  }
  return result.value;
};


/*
 * A internal usage to flatten a nested array.
 *
 * @private
 * @method  flattenArray
 * @param   array {Array}
 * @return  {Mixed}
 */

flattenArray = function(array) {
  var arr, lib;
  lib = this;
  arr = [];
  if (lib.isArray(array)) {
    lib.each(array, function(n, i) {
      return arr = arr.concat(flattenArray.call(lib, n));
    });
  } else {
    arr = array;
  }
  return arr;
};


/*
 * 获取小数点后面的位数
 *
 * @private
 * @method  floatLength
 * @param   number {Number}
 * @return  {Integer}
 */

floatLength = function(number) {
  var rfloat;
  rfloat = /^([-+]?\d+)\.(\d+)$/;
  return (rfloat.test(number) ? (number + "").match(rfloat)[2] : "").length;
};


/*
 * Create an array contains specified range.
 *
 * @private
 * @method  range
 * @param   from {Number/String}
 * @param   to {Number/String}
 * @param   step {Number}
 * @param   callback {Function}
 * @return  {Array}
 */

range = function(begin, end, step, callback) {
  var array;
  array = [];
  while (begin <= end) {
    array.push(callback ? callback(begin) : begin);
    begin += step;
  }
  return array;
};


/*
 * Filter elements in a set.
 * 
 * @private
 * @method  filterElement
 * @param   target {Array/Object/String}    operated object
 * @param   callback {Function}             callback to change unit's value
 * @param   context {Mixed}                 context of callback
 * @param   method {Function}               Array's prototype method
 * @param   func {Function}                 callback for internal usage
 * @return  {Array/Object/String}           与被过滤的目标相同类型
 */

filterElement = function(target, callback, context, method, func) {
  var arrOrStr, lib, plainObj, result, _ref;
  result = null;
  lib = this;
  if (lib.isFunction(callback)) {
    arrOrStr = (_ref = lib.type(target)) === "array" || _ref === "string";
    if (context == null) {
      context = window;
    }
    if (lib.isFunction(method) && arrOrStr) {
      result = method.apply(target, [callback, context]);
    } else {
      plainObj = lib.isPlainObject(target);
      if (plainObj) {
        result = {};
      } else if (arrOrStr) {
        result = [];
      }
      if (result !== null) {
        lib.each(target, function(ele, idx) {
          var cbVal;
          cbVal = callback.apply(context, [ele, idx, lib.isString(target) ? new String(target) : target]);
          func(result, cbVal, ele, idx, plainObj, arrOrStr);
          return true;
        });
      }
    }
    if (lib.isString(target)) {
      result = result.join("");
    }
  }
  return result;
};

storage.modules.Core.Array = {
  value: [],
  validator: function(object) {
    return isArr(object);
  },
  handlers: [
    {

      /*
       * 元素在数组中的位置
       * 
       * @method  inArray
       * @param   element {Mixed}   待查找的数组元素
       * @param   array {Array}     数组
       * @param   from {Integer}    起始索引
       * @return  {Integer}
       */
      name: "inArray",
      handler: function(element, array, from) {
        var index, indexOf, length;
        index = -1;
        indexOf = Array.prototype.indexOf;
        length = array.length;
        from = from ? (from < 0 ? Math.max(0, length + from) : from) : 0;
        if (indexOf) {
          index = indexOf.apply(array, [element, from]);
        } else {
          while (from < length) {
            if (from in array && array[from] === element) {
              index = from;
              break;
            }
            from++;
          }
        }
        return index;
      },
      validator: function(element, array) {
        return isArr(array);
      },
      value: -1
    }, {

      /*
       * 过滤数组、对象
       *
       * @method  filter
       * @param   target {Array/Object/String}    被过滤的目标
       * @param   callback {Function}             过滤用的回调函数
       * @param   [context] {Mixed}               回调函数的上下文
       * @return  {Array/Object/String}           与被过滤的目标相同类型
       *
       * refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
       */
      name: "filter",
      handler: function(target, callback, context) {
        return filterElement.apply(this, [
          target, callback, context, [].filter, function(stack, cbVal, ele, idx, plainObj, arrOrStr) {
            if (cbVal) {
              if (plainObj) {
                return stack[idx] = ele;
              } else if (arrOrStr) {
                return stack.push(ele);
              }
            }
          }
        ]);
      },
      validator: function(target) {
        var _ref;
        return isArr(target) || ((_ref = typeof target) === "object" || _ref === "string");
      },
      value: null
    }, {

      /*
       * 改变对象/数组/字符串每个单位的值
       *
       * @method  map
       * @param   target {Array/Object/String}    被操作的目标
       * @param   callback {Function}             改变单位值的回调函数
       * @param   [context] {Mixed}               回调函数的上下文
       * @return  {Array/Object/String}           与被过滤的目标相同类型
       *
       * refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
       */
      name: "map",
      handler: function(target, callback, context) {
        return filterElement.apply(this, [
          target, callback, context, [].map, function(stack, cbVal, ele, idx, plainObj, arrOrStr) {
            return stack[idx] = cbVal;
          }
        ]);
      },
      validator: function(target) {
        var _ref;
        return isArr(target) || ((_ref = typeof target) === "object" || _ref === "string");
      },
      value: null
    }, {

      /*
       * Calculate product of an array.
       *
       * @method  product
       * @param   array {Array}
       * @return  {Number}
       */
      name: "product",
      handler: function(array) {
        var count, lib, result;
        result = 1;
        count = 0;
        lib = this;
        lib.each(array, function(number, index) {
          if (lib.isNumeric(number)) {
            count++;
            return result *= number;
          }
        });
        if (count === 0) {
          return 0;
        } else {
          return result;
        }
      },
      value: null
    }, {

      /*
       * Remove repeated values.
       * A numeric type string will be converted to number.
       *
       * @method  unique
       * @param   array {Array}
       * @param   last {Boolean}  whether keep the last value
       * @return  {Array}
       */
      name: "unique",
      handler: function(array, last) {
        var lib, result;
        result = [];
        lib = this;
        last = !!last;
        lib.each((last ? array.reverse() : array), function(n, i) {
          if (lib.isNumeric(n)) {
            n = parseFloat(n);
          }
          if (lib.inArray(n, result) === -1) {
            return result.push(n);
          }
        });
        if (last) {
          array.reverse();
          result.reverse();
        }
        return result;
      },
      value: null
    }, {

      /*
       * 建立一个包含指定范围单元的数组
       * 返回数组中从 from 到 to 的单元，包括它们本身。
       * 如果 from > to，则序列将从 to 到 from。
       *
       * @method  range
       * @param   from {Number/String}    起始单元
       * @param   to {Number/String}      终止单元
       * @param   [step] {Number}         单元之间的步进值
       * @return  {Array}
       *
       * refer: http://www.php.net/manual/en/function.range.php
       */
      name: "range",
      handler: function(from, to, step) {
        var callback, decDigit, l_from, l_step, l_to, lib, rCharL, rCharU, result;
        result = [];
        lib = this;
        step = lib.isNumeric(step) && step * 1 > 0 ? step * 1 : 1;
        if (lib.isNumeric(from) && lib.isNumeric(to)) {
          l_from = floatLength(from);
          l_to = floatLength(to);
          l_step = floatLength(step);
          decDigit = Math.max(l_from, l_to, l_step);
          if (decDigit > 0) {
            decDigit = lib.zerofill(1, decDigit + 1) * 1;
            step *= decDigit;
            callback = function(number) {
              return number / decDigit;
            };
          } else {
            decDigit = 1;
          }
          from *= decDigit;
          to *= decDigit;
        } else {
          rCharL = /^[a-z]$/;
          rCharU = /^[A-Z]$/;
          from += "";
          to += "";
          if (rCharL.test(from) && rCharL.test(to) || rCharU.test(from) && rCharU.test(to)) {
            from = from.charCodeAt(0);
            to = to.charCodeAt(0);
            callback = function(code) {
              return String.fromCharCode(code);
            };
          }
        }
        if (lib.isNumber(from) && lib.isNumber(to)) {
          if (from > to) {
            result = range(to, from, step, callback).reverse();
          } else if (from < to) {
            result = range(from, to, step, callback);
          } else {
            result = [callback ? callback(from) : from];
          }
        }
        return result;
      },
      validator: function() {
        return true;
      }
    }, {

      /*
       * Apply a function simultaneously against two values of the 
       * array (default is from left-to-right) as to reduce it to a single value.
       *
       * @method  reduce
       * @param   array {Array}           An array of numeric values to be manipulated.
       * @param   callback {Function}     Function to execute on each value in the array.
       * @param   [initialValue] {Mixed}  Object to use as the first argument to the first call of the callback.
       * @param   [right] {Boolean}       Whether manipulates the array from right-to-left.
       * @return  {Mixed}
       *
       * Callback takes four arguments:
       *  - previousValue
       *          The value previously returned in the last invocation of the callback, or initialValue, if supplied.
       *  - currentValue
       *          The current element being processed in the array.
       *  - index
       *          The index of the current element being processed in the array.
       *  - array
       *          The array reduce was called upon.
       *
       * refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
       *        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight
       */
      name: "reduce",
      handler: function(array, callback, initialValue, right) {
        var args, hasInitVal, index, length, lib, origin, result;
        lib = this;
        right = !!right;
        if (lib.isArray(array)) {
          args = arguments;
          origin = right ? [].reduceRight : [].reduce;
          hasInitVal = args.length > 2;
          if (origin) {
            result = origin.apply(array, hasInitVal ? [callback, initialValue] : [callback]);
          } else {
            index = 0;
            length = array.length;
            if (!hasInitVal) {
              initialValue = array[0];
              index = 1;
              length--;
            }
            if (lib.isFunction(callback)) {
              length = hasInitVal ? length : length + 1;
              while (index < length) {
                initialValue = callback.apply(window, [initialValue, array[index], index, array]);
                index++;
              }
              result = initialValue;
            }
          }
        }
        return result;
      },
      value: null
    }, {

      /*
       * Flattens a nested array.
       *
       * @method  flatten
       * @param   array {Array}   a nested array
       * @return  {Array}
       */
      name: "flatten",
      handler: function(array) {
        return flattenArray.call(this, array);
      }
    }, {

      /*
       * Returns a shuffled copy of the list, using a version of the Fisher-Yates shuffle.
       *
       * @method  shuffle
       * @param   target {Mixed}
       * @return  {Array}
       *
       * refer: http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
       */
      name: "shuffle",
      handler: function(target) {
        var index, lib, rand, shuffled;
        lib = this;
        shuffled = [];
        index = 0;
        rand = void 0;
        lib.each(target, function(value) {
          rand = lib.random(index++);
          shuffled[index - 1] = shuffled[rand];
          shuffled[rand] = value;
          return true;
        });
        return shuffled;
      },
      value: null
    }, {

      /*
       * Calculate the sum of values in a collection.
       *
       * @method  sum
       * @param   collection {Array/Object}
       * @return  {Number}
       */
      name: "sum",
      handler: function(collection) {
        var result;
        result = NaN;
        if (isCollection.call(this, collection)) {
          result = 0;
          this.each(collection, function(value) {
            return result += value * 1;
          });
        }
        return result;
      },
      validator: function() {
        return true;
      },
      value: NaN
    }, {

      /*
       * Return the maximum element or (element-based computation).
       *
       * @method  max
       * @param   target {Array/Object}
       * @param   callback {Function}
       * @param   [context] {Mixed}
       * @return  {Number}
       */
      name: "max",
      handler: function(target, callback, context) {
        return getMaxMin.apply(this, [-Infinity, "max", target, callback, (arguments.length < 3 ? window : context)]);
      },
      validator: function() {
        return true;
      }
    }, {

      /*
       * Return the minimum element (or element-based computation).
       *
       * @method  min
       * @param   target {Array/Object}
       * @param   callback {Function}
       * @param   [context] {Mixed}
       * @return  {Number}
       */
      name: "min",
      handler: function(target, callback, context) {
        return getMaxMin.apply(this, [Infinity, "min", target, callback, (arguments.length < 3 ? window : context)]);
      },
      validator: function() {
        return true;
      }
    }, {

      /*
       * 获取第一个单元
       *
       * @method   first
       * @param    target {String/Array/Array-like Object}
       * @return   {Anything}
       */
      name: "first",
      handler: function(target) {
        return this.slice(target, 0, 1)[0];
      },
      validator: function() {
        return true;
      }
    }, {

      /*
       * 获取最后一个单元
       *
       * @method   last
       * @param    target {String/Array/Array-like Object}
       * @return   {Anything}
       */
      name: "last",
      handler: function(target) {
        return this.slice(target, -1)[0];
      },
      validator: function() {
        return true;
      }
    }
  ]
};


/*
 * Ignore specified strings.
 *
 * @private
 * @method  ignoreSubStr
 * @param   string {String}         The input string. Must be one character or longer.
 * @param   length {Integer}        The number of characters to extract.
 * @param   ignore {String/RegExp}  Characters to be ignored (will not include in the length).
 * @return  {String}
 */

ignoreSubStr = function(string, length, ignore) {
  var exp, lib, result;
  lib = this;
  exp = lib.isRegExp(ignore) ? ignore : new RegExp(ignore, "ig");
  if (!exp.global) {
    exp = new RegExp(exp.source, "ig");
  }
  result = exp.exec(string);
  while (result) {
    if (result.index < length) {
      length += result[0].length;
    }
    result.lastIndex = 0;
  }
  return string.substring(0, length);
};


/*
 * 将字符串转换为以 \u 开头的十六进制 Unicode
 * 
 * @private
 * @method  unicode
 * @param   string {String}
 * @return  {String}
 */

unicode = function(string) {
  var chr, lib, result;
  lib = this;
  result = [];
  if (lib.isString(string)) {
    result = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = string.length; _i < _len; _i++) {
        chr = string[_i];
        _results.push("\\u" + (lib.pad(Number(chr.charCodeAt(0)).toString(16), 4, '0').toUpperCase()));
      }
      return _results;
    })();
  }
  return result.join("");
};


/*
 * 将 UTF8 字符串转换为 BASE64
 * 
 * @private
 * @method  utf8_to_base64
 * @param   string {String}
 * @return  {String}
 */

utf8_to_base64 = function(string) {
  var atob, btoa, result;
  result = string;
  btoa = window.btoa;
  atob = window.atob;
  if (this.isString(string)) {
    if (this.isFunction(btoa)) {
      result = btoa(unescape(encodeURIComponent(string)));
    }
  }
  return result;
};

storage.modules.Core.String = {
  value: "",
  validator: function(object) {
    return this.isString(object);
  },
  handlers: [
    {

      /*
       * 用指定占位符填补字符串
       * 
       * @method  pad
       * @param   string {String}         源字符串
       * @param   length {Integer}        生成字符串的长度，正数为在后面补充，负数则在前面补充
       * @param   placeholder {String}    占位符
       * @return  {String}
       */
      name: "pad",
      handler: function(string, length, placeholder) {
        var index, len, unit;
        if (this.isString(placeholder) === false || placeholder.length !== 1) {
          placeholder = "\x20";
        }
        if (!this.isInteger(length)) {
          length = 0;
        }
        string = String(string);
        index = 1;
        unit = String(placeholder);
        len = Math.abs(length) - string.length;
        if (len > 0) {
          while (index < len) {
            placeholder += unit;
            index++;
          }
          string = length > 0 ? string + placeholder : placeholder + string;
        }
        return string;
      },
      validator: function(string) {
        var _ref;
        return (_ref = typeof string) === "string" || _ref === "number";
      }
    }, {

      /*
       * 将字符串首字母大写
       * 
       * @method  capitalize
       * @param   string {String}     源字符串
       * @param   isAll {Boolean}     是否将所有英文字符串首字母大写
       * @return  {String}
       */
      name: "capitalize",
      handler: function(string, isAll) {
        var exp;
        exp = "[a-z]+";
        return string.replace((isAll === true ? new RegExp(exp, "ig") : new RegExp(exp)), function(c) {
          return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
        });
      }
    }, {

      /*
       * 将字符串转换为驼峰式
       * 
       * @method  camelCase
       * @param   string {String}         源字符串
       * @param   is_upper {Boolean}      是否为大驼峰式
       * @return  {String}
       */
      name: "camelCase",
      handler: function(string, is_upper) {
        var firstLetter;
        string = string.toLowerCase().replace(/[-_\x20]([a-z]|[0-9])/ig, function(all, letter) {
          return letter.toUpperCase();
        });
        firstLetter = string.charAt(0);
        string = (is_upper === true ? firstLetter.toUpperCase() : firstLetter.toLowerCase()) + string.slice(1);
        return string;
      }
    }, {

      /*
       * 补零
       * 
       * @method  zerofill
       * @param   number {Number}     源数字
       * @param   digit {Integer}     数字位数，正数为在后面补充，负数则在前面补充
       * @return  {String}
       */
      name: "zerofill",
      handler: function(number, digit) {
        var isFloat, lib, prefix, result, rfloat;
        result = "";
        lib = this;
        rfloat = /^([-+]?\d+)\.(\d+)$/;
        isFloat = rfloat.test(number);
        prefix = "";
        digit = parseInt(digit);
        if (digit > 0 && isFloat) {
          number = (number + "").match(rfloat);
          prefix = "" + (number[1] * 1) + ".";
          number = number[2];
        } else if (number * 1 < 0) {
          prefix = "-";
          number = (number + "").substring(1);
        }
        result = lib.pad(number, digit, "0");
        result = digit < 0 && isFloat ? "" : prefix + result;
        return result;
      },
      validator: function(number, digit) {
        return this.isNumeric(number) && this.isNumeric(digit) && /^-?[1-9]\d*$/.test(digit);
      }
    }, {

      /*
       * Removes whitespace from both ends of the string.
       *
       * @method  trim
       * @param   string {String}
       * @return  {String}
       * 
       * refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
       */
      name: "trim",
      handler: function(string) {
        var rtrim;
        rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        func = "".trim;
        if (func && !func.call("\uFEFF\xA0")) {
          return func.call(string);
        } else {
          return string.replace(rtrim, "");
        }
      }
    }
  ]
};


/*
 * 将日期字符串转化为日期对象
 *
 * @private
 * @method   dateStr2obj
 * @param    date_str {String}
 * @return   {Date}
 */

dateStr2obj = function(date_str) {
  var date, date_parts;
  date_str = this.trim(date_str);
  date = new Date(date_str);
  if (isNaN(date.getTime())) {
    date_parts = date_str.match(storage.regexps.date.iso8601);
    date = date_parts != null ? ISOstr2date.call(this, date_parts) : new Date;
  }
  return date;
};


/*
 * ISO 8601 日期字符串转化为日期对象
 *
 * @private
 * @method   ISOstr2date
 * @param    date_parts {Array}
 * @return   {Date}
 */

ISOstr2date = function(date_parts) {
  var date, tz_offset;
  date_parts.shift();
  date = UTCstr2date.call(this, date_parts);
  tz_offset = timezoneOffset(date_parts.slice(-1)[0]);
  if (tz_offset !== 0) {
    date.setTime(date.getTime() - tz_offset);
  }
  return date;
};


/*
 * 转化为 UTC 日期对象
 *
 * @private
 * @method   UTCstr2date
 * @param    date_parts {Array}
 * @return   {Date}
 */

UTCstr2date = function(date_parts) {
  var date, handlers;
  handlers = ["FullYear", "Month", "Date", "Hours", "Minutes", "Seconds", "Milliseconds"];
  date = new Date;
  this.each(date_parts, function(ele, i) {
    var handler;
    if ((ele != null) && ele !== "") {
      handler = handlers[i];
      if (handler != null) {
        return date["setUTC" + handler](ele * 1 + (handler === "Month" ? -1 : 0));
      }
    }
  });
  return date;
};


/*
 * 相对于 UTC 的偏移值
 *
 * @private
 * @method   timezoneOffset
 * @param    timezone {String}
 * @return   {Integer}
 */

timezoneOffset = function(timezone) {
  var cap, offset;
  offset = 0;
  if (/^(Z|[+-]\d{2}\:\d{2})$/.test(timezone)) {
    cap = timezone.charAt(0);
    if (cap !== "Z") {
      offset = timezone.substring(1).split(":");
      offset = (cap + (offset[0] * 60 + offset[1] * 1)) * 60 * 1000;
    }
  }
  return offset;
};

DateTimeNames = {
  month: {
    long: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  week: {
    long: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thurday", "Friday", "Saturday"],
    short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  }
};

DateTimeFormats = {
  "d": function(date) {
    return dtwz.call(this, date.getDate());
  },
  "D": function(date) {
    return DateTimeNames.week.short[date.getDay()];
  },
  "j": function(date) {
    return date.getDate();
  },
  "l": function(date) {
    return DateTimeNames.week.long[date.getDay()];
  },
  "N": function(date) {
    var day;
    day = date.getDay();
    if (day === 0) {
      day = 7;
    }
    return day;
  },
  "S": function(date) {
    var suffix;
    switch (String(date.getDate()).slice(-1)) {
      case "1":
        suffix = "st";
        break;
      case "2":
        suffix = "nd";
        break;
      case "3":
        suffix = "rd";
        break;
      default:
        suffix = "th";
    }
    return suffix;
  },
  "w": function(date) {
    return date.getDay();
  },
  "F": function(date) {
    return DateTimeNames.month.long[date.getMonth()];
  },
  "m": function(date) {
    return dtwz.call(this, DateTimeFormats.n.call(this, date));
  },
  "M": function(date) {
    return DateTimeNames.month.short[date.getMonth()];
  },
  "n": function(date) {
    return date.getMonth() + 1;
  },
  "Y": function(date) {
    return date.getFullYear();
  },
  "y": function(date) {
    return String(date.getFullYear()).slice(-2);
  },
  "a": function(date) {
    var h;
    h = date.getHours();
    if ((0 < h && h < 12)) {
      return "am";
    } else {
      return "pm";
    }
  },
  "A": function(date) {
    return DateTimeFormats.a.call(this, date).toUpperCase();
  },
  "g": function(date) {
    var h;
    h = date.getHours();
    if (h === 0) {
      h = 24;
    }
    if (h > 12) {
      return h - 12;
    } else {
      return h;
    }
  },
  "G": function(date) {
    return date.getHours();
  },
  "h": function(date) {
    return dtwz.call(this, DateTimeFormats.g.call(this, date));
  },
  "H": function(date) {
    return dtwz.call(this, DateTimeFormats.G.call(this, date));
  },
  "i": function(date) {
    return dtwz.call(this, date.getMinutes());
  },
  "s": function(date) {
    return dtwz.call(this, date.getSeconds());
  }
};


/*
 * 添加前导“0”
 *
 * @private
 * @method   dtwz
 * @param    datetime {Integer}
 * @return   {String}
 */

dtwz = function(datetime) {
  return this.pad(datetime, -2, "0");
};


/*
 * 格式化日期
 *
 * @private
 * @method   formatDate
 * @param    format {String}
 * @param    date {Date}
 * @return   {String}
 */

formatDate = function(format, date) {
  var context, formatted;
  if (!this.isDate(date) || isNaN(date.getTime())) {
    date = new Date;
  }
  context = this;
  formatted = format.replace(new RegExp("([a-z]|\\\\)", "gi"), function() {
    var handler, m, o, p, s, _i;
    m = arguments[0], p = 4 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 2) : (_i = 1, []), o = arguments[_i++], s = arguments[_i++];
    if (m === "\\") {
      return "";
    } else {
      if (s.charAt(o - 1) !== "\\") {
        handler = DateTimeFormats[m];
      }
    }
    if (handler != null) {
      return handler.call(context, date);
    } else {
      return m;
    }
  });
  return formatted;
};

storage.modules.Core.Date = {
  handlers: [
    {

      /*
       * 格式化日期对象/字符串
       *
       * format 参照 PHP：
       *   http://www.php.net/manual/en/function.date.php
       * 
       * @method  date
       * @param   format {String}
       * @param   [date] {Date/String}
       * @return  {String}
       */
      name: "date",
      handler: function(format, date) {
        if (this.isString(date)) {
          date = dateStr2obj.call(this, date);
        }
        return formatDate.apply(this, [format, date]);
      },
      value: "",
      validator: function(format) {
        return this.isString(format);
      }
    }, {

      /*
       * 取得当前时间
       *
       * @method   now
       * @param    [is_object] {Boolean}
       * @return   {Integer/Date}
       */
      name: "now",
      handler: function(is_object) {
        var date;
        date = new Date;
        if (is_object === true) {
          return date;
        } else {
          return date.getTime();
        }
      }
    }
  ]
};

__util = __proc(storage.modules);

try {
  Object.defineProperty(__util, "__meta__", {
    __proto__: null,
    writable: true,
    value: LIB_CONFIG
  });
} catch (_error) {
  error = _error;
  __util.mixin({
    __meta__: LIB_CONFIG
  });
}

window[LIB_CONFIG.name] = __util;

}));
