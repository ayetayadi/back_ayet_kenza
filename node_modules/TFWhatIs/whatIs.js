"use strict";

var phoneNumber = require("libphonenumber");
var chalk = require('chalk');

function What() {

}

/**
 * [function description]
 * @param  {[any]} what [input any type]
 * @return {[String]}      [returns the string of type]
 */
What.prototype.type = function(what) {
  var type = Object.prototype.toString.call(what).slice(8, -1);
  var email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var url = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  if (type === "String") {
    if (email.test(what)) {
      return 'Email';
    }
    if (url.test(what)) {
      return 'Url';
    }
    try {
      if (phoneNumber.validate(what) === true) {
        return 'Phone';
      }
    } catch (e) {
      return 'String';
    }
  }
  if (type === "Number") {
    if (this.isNaN(what)) {
      return 'NaN';
    } else if (what % 1 !== 0 &&
              what !== Infinity &&
              what !== -Infinity) {
      return 'Float';
    } else if (what % 1 === 0) {
      return 'Int';
    } else {
      return 'Number';
    }
  }
  return type;
};

/**
 * [function description]
 * @param  {[type]} what [description]
 * @return {[type]}      [description]
 */
What.prototype.trueType = function(what) {
  return Object.prototype.toString.call(what).slice(8, -1);
};

/**
 * [function description]
 * @param  {[any]} what [description]
 * @return {[type]}      [description]
 */
What.prototype.isNaN = function(what) {
  if (what !== what) {
    return true;
  }
  return false;
};

/**
 * [function description]
 * @param  {[any]} what [description]
 * @return {[type]}      [description]
 */
What.prototype.isFalsey = function(what) {
  if (this.trim(what)) {
    if (this.type(what) === "Object" &&
        JSON.stringify(what) === "{}") {
        return true;
    }
    if (this.type(what) === "Array" &&
        this.trim(what).length === 0) {
          return true;
    }
    return false;
  }
  return true;
};

/**
 * [function description]
 * @param  {[type]} what [description]
 * @return {[type]}      [description]
 */
What.prototype.isEmpty = function(what) {
  if (this.trim(what) ||
      this.trim(what) === false ||
      this.trim(what) === 0) {
    if (this.type(what) === "Object" &&
        JSON.stringify(what) === "{}") {
        return true;
    }
    if (this.type(what) === "Array" &&
        what.length === 0) {
      return true;
    }
    return false;
  }
  return true;
};

/**
 * [function description]
 * @param  {[type]} what [description]
 * @return {[type]}      [description]
 */
What.prototype.trim = function(what) {
  if (this.type(what) === "String") {
    return what.trim();
  }
  if (this.type(what) === "Array") {
    return what.filter(Boolean);
  }
  return what;
};

/**
 * [function description]
 * @param  {[type]} what  [description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
What.prototype.prefixInArray = function(what, query) {
  var type = this.type(what),
      matches,
      _this = this;
  if (this.type(query) === "String" &&
      query.length > 0 &&
      type === "Array" &&
      type.length > 0) {
    matches = what.filter(function(whatValue) {
      var valueType = _this.trueType(whatValue);
      if (whatValue &&
          valueType === "String") {
        return (whatValue.substring(0, query.length) === query);
      }
    });
    return matches;
  }

  return what;
};

/**
 * [function description]
 * @param  {[type]} what  [description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
What.prototype.sufixInArray = function(what, query) {
  var type = this.type(what),
      matches,
      _this = this;
  if (this.type(query) === "String" &&
      query.length > 0 &&
      type === "Array" &&
      type.length > 0) {
    matches = what.filter(function(whatValue) {
      var valueType = _this.trueType(whatValue);
      if (whatValue &&
          valueType === "String") {
        let valueLength = whatValue.length;
        return (whatValue.substring(valueLength - query.length, valueLength) === query);
      }
    });
    return matches;
  }

  return what;
};

/**
 * [function description]
 * @param  {[type]} what  [description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
What.prototype.findInArray = function(what, query) {
  var type = this.type(what),
      matches,
      _this = this;
  if (this.type(query) === "String" &&
      query.length > 0 &&
      type === "Array" &&
      type.length > 0) {
    matches = what.filter(function(whatValue) {
      var valueType = _this.trueType(whatValue);
      if (whatValue &&
          valueType === "String") {
        return whatValue.indexOf(query) >= 0;
      }
    });
    return matches;
  }

  return what;
};

/**
 * [function description]
 * @param  {[type]}   items [description]
 * @param  {Function} cb    [description]
 * @return {[type]}         [description]
 */
What.prototype.for = function(items, cb) {
  if (this.trueType(cb) === "Function") {
    if (this.trueType(items) === "Array" || this.trueType(items) === "Object") {
      for (let itemKey in items) {
        if (items.hasOwnProperty(itemKey)) {
          cb(itemKey, items[itemKey], items);
        }
      }
    } else {
      cb();
      throw new Error("Unexpected type");
    }
  }

  return;

};

/**
 * [function description]
 * @param  {[type]} newObj   [description]
 * @param  {[type]} path     [description]
 * @param  {[type]} val      [description]
 * @param  {[type]} notation [description]
 * @return {[type]}          [description]
 */
What.prototype.setObjPath = function(newObj, path, val, notation) {
  var _this = this;
  function isObject(newObj) {
    return (_this.trueType(newObj) === 'Object' && !!newObj);
  }
  notation = notation || '.';
  path.split(notation).reduce(function(prev, cur, idx, arry) {
    var isLast = (idx === arry.length - 1);
    // if <cur> is last part of path
    if (isLast) {
      return (prev[cur] = val);
    }
    // if <cur> is not last part of path, then returns object if existing value is object or empty object
    return (isObject(prev[cur])) ? prev[cur] : (prev[cur] = {});
  }, newObj);

  return newObj;
};

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
        var cls = function(match) {
          return chalk.yellow(match);
        };
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = function(match) {
                  return chalk.red(match);
                };
            } else {
                cls = function(match) {
                  return chalk.magenta(match);
                };
            }
        } else if (/true|false/.test(match)) {
            cls = function(match) {
              return chalk.blue(match);
            };
        } else if (/null/.test(match)) {
            cls = function(match) {
              return chalk.cyan(match);
            };
        }
        return cls(match);
    });
}

What.prototype.c = function(what) {

  switch (this.trueType(what)) {
    case "Object" || "Array":
      console.log(syntaxHighlight(JSON.stringify(what, undefined, 3)));
      break;
    case "Number":
      console.log(chalk.yellow(what));
      break;
    case "String":
      try {
        console.log(syntaxHighlight(JSON.stringify(JSON.parse(what), undefined, 3)));
      } catch (e) {
        console.log(chalk.magenta(what));
      }
      break;
    case "Undefined":
      console.log(chalk.red(what));
      break;
    case "Boolean":
      console.log(chalk.blue(what));
      break;
    case "Date":
      console.log(chalk.green(what));
      break;
    case "Null":
      console.log(chalk.cyan(what));
      break;
    default:
      console.log(chalk.black(what));
      break;
  }

};

What.prototype.ce = function(what) {
  console.error(chalk.red(what));
};

What.prototype.cw = function(what) {
  console.warn(chalk.yellow(what));
};

module.exports = new What();
