var ObjectObserver = require("observe-js").ObjectObserver ;
var PathObserver = require("observe-js").PathObserver ;
var jslint = require("./jslint");

// configure the syntax
var regex;
function setRegex(r) {
  regex = r;
  _.templateSettings = {
    interpolate: regex
  };
}
// defaults to {{ name }} 
setRegex(/{{(.+?)}}/gi);

function setValue(obj, path, value) {
  for (var i=0, path=path.split('.'), len=path.length - 1; i<len; i++){
    obj = obj[path[i]];
  }
  obj[path[i]] = value;
  Platform.performMicrotaskCheckpoint();
}

function injectValue(view, prop, value, $model, tags){
  var template = _.template(value);
  view[prop] =  template($model);
}

function initProperty($model, prop, expr) {
  if ($model[prop] === undefined) {
    var re = new RegExp(prop+"\\.");
    $model[prop] = expr.match(re) ? {} : "";
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
          tags.forEach(function(tag) {
            var expr = tag.substring(2,tag.length -2);
            (function(view, prop, value,$model, tags) {
              getUndefs(expr).forEach(function(key) {
                if (typeof key === "string") {
                  initProperty($model, key, expr);
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
          injectValue(view, prop, value, $model, tags);
          if (!view.oneway && tags[0] === value){
            var tag = tags[0];
            var  expr = tag.substring(2,tag.length -2);
            var undefs = getUndefs(expr);
            if (undefs.length === 1 && prop === 'value') { //locking to value for the moment - not mandatory
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
  }
} 
function getUndefs(expr) {
  if (!jslint(expr)) {
    return _.reduce(jslint.errors,function(acc, err) {
              if(err.code === 'used_before_a') {
                acc.push(err.a);
              }
              return acc;
            }, []);
  } 
  
  return [];
}
init.syntax = setRegex;
init.apply = function() {
  Platform.performMicrotaskCheckpoint();
}
module.exports = init; 
