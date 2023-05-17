// CHESSAPP.utils - Utility functions for the chess application

// Creating a private scope using an immediately-invoked function expression (IIFE)

CHESSAPP.utils = (function () {
  let benchmark = {}; // Object for benchmarking
  this.extend = function (o, p) {
    // Function to extend an object with properties from another object
    for (prop in p) {
      o[prop] = p[prop];
    }
    return o;
  };
  this.bm_start = function (msg) {
    // Function to start the benchmarking timer
    benchmark.timeStart = Date.now();
    benchmark.msg = msg;
  };

  this.bm_end = function () {
    // Function to calculate the difference in time for benchmarking
    let difference = Date.now() - benchmark.timeStart;
  };

  this.bind = null; // Placeholder for the bind function (event listener attachment)
  this.removeClass = function (elem, className) {
    // Function to remove a class from an element's className
    let regex = new RegExp("(^| )" + className + "( |$)", "gi");

    let curClass = elem.className;
    curClass = curClass.replace(regex, "");
    elem.className = curClass;
  };

  this.addClass = function (elem, className) {
    // Function to add a class to an element's className
    if (elem.className != "") {
      this.removeClass(elem, className);
    }
    elem.className += " " + className;
  };

  this.shallowCopy = function (o) {
    // Function to create a shallow copy of an object
    let c = {};
    for (let p in o) {
      if (o.hasOwnProperty(p)) {
        c[p] = o[p];
      }
    }
    return c;
  };
  return this; // Returning the utility object with the defined functions
})();

CHESSAPP.utils = (function () {
  let benchmark = {};
  this.extend = function (o, p) {
    for (prop in p) {
      o[prop] = p[prop];
    }
    return o;
  };
  this.bm_start = function (msg) {
    benchmark.timeStart = Date.now();
    benchmark.msg = msg;
  };
  this.bm_end = function () {
    let difference = Date.now() - benchmark.timeStart;
  };
  this.bind = null;
  this.removeClass = function (elem, className) {
    let regex = new RegExp("(^| )" + className + "( |$)", "gi");
    let curClass = elem.className;
    curClass = curClass.replace(regex, "");
    elem.className = curClass;
  };
  this.addClass = function (elem, className) {
    if (elem.className != "") {
      this.removeClass(elem, className);
    }
    elem.className += " " + className;
  };
  this.shallowCopy = function (o) {
    let c = {};
    for (let p in o) {
      if (o.hasOwnProperty(p)) {
        c[p] = o[p];
      }
    }
    return c;
  };

  return this;
})();
if (typeof window.addEventListener === "function") {
  CHESSAPP.utils.bind = function (elem, type, fn) {
    elem.addEventListener(type, fn, false);
  };
  CHESSAPP.utils.unbind = function (elem, type, fn) {
    elem.removeEventListener(type, fn, false);
  };
} else if (typeof attachEvent === "function") {
  CHESSAPP.utils.bind = function (elem, type, fn) {
    elem.attachEvent("on" + type, fn);
  };
  CHESSAPP.utils.unbind = function (elem, type, fn) {
    elem.detachEvent("on" + type, fn);
  };
} else {
  CHESSAPP.utils.bind = function (elem, type, fn) {
    elem["on" + type] = fn;
  };
  CHESSAPP.utils.unbind = function (elem, type, fn) {
    elem["on" + type] = null;
  };
}
if (!window.JSON) {
  // Function to parse a JSON string
  window.JSON = {
    parse: function (sJSON) {
      return eval("(" + sJSON + ")");
    },
    stringify: function (vContent) {
      // Function to convert a JavaScript value to a JSON string
      if (vContent instanceof Object) {
        let sOutput = "";
        if (vContent.constructor === Array) {
          // Handling arrays
          for (
            let nId = 0;
            nId < vContent.length;
            sOutput += this.stringify(vContent[nId]) + ",", nId++
          );
          return "[" + sOutput.substr(0, sOutput.length - 1) + "]";
        }
        if (vContent.toString !== Object.prototype.toString) {
          // Handling non-array objects with a custom toString method
          return '"' + vContent.toString().replace(/"/g, "\\$&") + '"';
        }

        for (let sProp in vContent) {
          // Handling regular objects
          sOutput +=
            '"' + sProp.replace(/"/g, "\\$&") + '":' + this.stringify(vContent[sProp]) + ",";
        }
        return "{" + sOutput.substr(0, sOutput.length - 1) + "}";
      }
      return typeof vContent === "string"
        ? '"' + vContent.replace(/"/g, "\\$&") + '"'
        : String(vContent);
    },
  };
}
