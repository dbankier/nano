var observejs = require("observe-js");
var ObjectObserver = observejs.ObjectObserver ;
var PathObserver = observejs.PathObserver ;
var jslint = require("./jslint");
var async = require("async");

// plugins
var safeinit = require("./plugins/nano-safeinit");
var oneway = require("./plugins/nano-oneway");


var hooks = {};

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

//sets the value in the model
function setValue(obj, path, value) {
  for (var i=0, path=path.split('.'), len=path.length - 1; i<len; i++){
    obj = obj[path[i]];
  }
  obj[path[i]] = value;
  Platform.performMicrotaskCheckpoint();
}

//injects the templated expression into the view
function injectValue(view, prop, value, $model){
  var template = _.template(value);
  view[prop] =  template($model);
}


//args: view, prop, expr, $model
function callHook(name, args, callback) {
  if (hooks[name]) {
    var tasks = hooks[name].map(function(hook) { 
      return function(callback) {
        hook(args, callback);
      };
    });
    async.series(tasks, callback);
  } else {
    callback();
  }
}

function nano($, $model) {
  for(var view_id in $.__views) {
    var view = $.__views[view_id];

    //the binding properties are different for widgets
    //need to iterate over the args property
    var iter = view;
    if (view.args && view.__controllerPath === "widget") {
      iter = view.args;
    }
    for(var prop in iter) {
      var value = iter[prop];
      if (typeof value === "string" && !prop.match(/^__/)) {
        var tags = value.match(regex);
        if (tags) {
          tags.forEach(function(tag) {
            var expr = tag.substring(2,tag.length -2);
            (function(view, prop, value,$model, tags) {
              getUndefs(expr).forEach(function(key) {
                if (typeof key === "string") {
                  callHook("model:bind", { $: $, $model: $model, view: view, expr: expr, prop: key }, function() {
                    var observer;
                    if (typeof $model[key] ==="object") {
                      observer = new ObjectObserver($model[key]);
                    } else {
                      observer = new PathObserver($model, key );
                    }
                    observer.open(function(newValue, oldValue){
                      callHook("model:change", { $: $, $model: $model, view: view, expr: expr, prop: prop }, function() {
                        if (OS_ANDROID && view.__manual_change) {
                          view.__manual_change = false;
                        } else {
                          injectValue(view, prop, value, $model);
                        }
                      });
                    });
                  });
                }
              });
            }(view, prop,value, $model, tags));
          });

          // initialise bound property in view
          callHook("view:init", { $: $, $model: $model, view: view, value: value, prop: prop }, function() {
            injectValue(view, prop, value, $model);
          });

          // setup binding on view changes
          if (tags[0] === value){
            var tag = tags[0];
            var  expr = tag.substring(2,tag.length -2);
            var undefs = getUndefs(expr);
            if (undefs.length === 1 && prop === 'value') { //locking to value for the moment - not mandatory
              callHook("view:bind", { $: $, $model: $model, view: view, expr: expr, prop: prop }, function() {
                //use change listener of view
                (function($model, expr, prop) {
                  view.addEventListener("change", function(e) {
                    callHook("view:change", { $: $, $model: $model, view: e.source, expr: expr, prop: prop }, function() {
                      // set value in model on change in view
                      if (OS_ANDROID) {
                        e.source.__manual_change = true;
                      }
                      setValue($model, expr, e.source[prop]);
                    });
                  });
                }($model, expr, prop));
              });
            }
          }
        }
      }
    }
  }
} 

//Gets undefined variables in a js expression. 
//Used to detect model properties to bind to.
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

//public API

nano.syntax = setRegex;
//trigger object-js model change (pre ES6)
nano.apply = function() {
  Platform.performMicrotaskCheckpoint();
}

//load a new plugin
nano.load = function(_module) {
  _module(nano);
};

//module hook function
nano.hook = function(hook, callback) {
  if (hooks[hook] === undefined) {
    hooks[hook] = [];
  }
  hooks[hook].push(callback);
};

//private nano function useful for plugins
nano.__callHook = callHook;
nano.__setValue = setValue;
nano.__injectValue = injectValue;
nano.__libs = {
  observejs: observejs,
  async: async
};

// load default plugins
nano.load(safeinit());
nano.load(oneway());

module.exports = nano; 
