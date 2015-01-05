var _  = require("alloy/underscore");
var ObjectObserver = require("observer").ObjectObserver ;
var PathObserver = require("observer").PathObserver ;
var jshint = require("jshint").JSHINT;

_.templateSettings = {
  interpolate: /\-\=(.+?)\=\-/g
};

var regex = /\-\=.+?\=\-/gi;

//polyfill
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

function evalWrapper(obj, path) {
  var str = "(function() {";
  for (var p in obj) {
    str +="var " + p + " = " + JSON.stringify(obj[p]) + ";"; 
  }
  str += "return " + path +" ;})();";
  return str;
}

function getValue(obj, exp) {
  return eval(evalWrapper(obj, exp)); 
}

function setValue(obj, path, value) {
  for (var i=0, path=path.split('.'), len=path.length - 1; i<len; i++){
    obj = obj[path[i]];
  }
  obj[path[i]] = value;
  Platform.performMicrotaskCheckpoint();
}

function injectValue(view, prop, value, $model, tags){
  var key;
  if (tags[0] !== value){
    var template = _.template(value);
    view[prop] =  template($model);
  } else {
    var tag = tags[0];
    key = tag.substring(2,tag.length -2);
    view[prop] = getValue($model, key);
  }

}

function init($, $model) {
  for(var view_id in $.__views) {
    var view = $.__views[view_id];
    for(var prop in view) {
      var value = view[prop];
      if (typeof value === "string") {
        var tags = value.match(regex);
        if (tags) {
          injectValue(view, prop, value, $model, tags);
          tags.forEach(function(tag) {
            var expr = tag.substring(2,tag.length -2);
            (function(view, prop, value,$model, tags) {
              jshint(expr);
              jshint.undefs[0].forEach(function(key) {
                if (typeof key === "string") {
                  var observer;
                  if (typeof $model[key] ==="object") {
                    observer = new ObjectObserver($model[key]);
                  } else {
                    observer = new PathObserver($model, key );
                  }
                  observer.open(function(newValue, oldValue){
                    injectValue(view, prop, value, $model, tags);
                  });
                }
              });
            }(view, prop,value, $model, tags));
          });
          if (tags[0] === value){
            var tag = tags[0];
            var  expr = tag.substring(2,tag.length -2);
            jshint(expr);
            var undefs = _.filter(jshint.undefs[0], function(o) { return typeof o === "string" && o !== "W117"; });
            if (undefs.length === 1) {
              var key = undefs[0];
              (function($model, expr, prop) {
                view.addEventListener("change", function(e) {
                  setValue($model, expr, e.source[prop]);
                });
              }($model, expr, prop));
            }
          }
        }
      }
    }
  };
}; 
init.apply = function() {
  Platform.performMicrotaskCheckpoint();
}
module.exports = init; 
