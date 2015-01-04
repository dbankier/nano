var _  = require("alloy/underscore");
var PathObserver = require("observer").PathObserver ;
_.templateSettings = {
  interpolate: /\-\=(.+?)\=\-/g
};

var regex = /\-\=[\w\d\.]+\=\-/gi;

function getValue(obj, path) {
  for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
    obj = obj[path[i]];
  }
  return obj;
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
    var map = {};
    tags.forEach(function(tag) {
      key = tag.substring(2,tag.length -2);
      map[key] = getValue($model, key);
    });
    view[prop] =  template(map);
  } else {
    var tag = tags[0];
    key = tag.substring(2,tag.length -2);
    view[prop] = getValue($model, key);
  }

}

module.exports = function($, $model) {
  for(var view_id in $.__views) {
    var view = $.__views[view_id];
    for(var prop in view) {
      var value = view[prop];
      if (typeof value === "string") {
        var tags = value.match(regex);
        if (tags) {
          injectValue(view, prop, value, $model, tags);
          tags.forEach(function(tag) {
            var key = tag.substring(2,tag.length -2);
            (function(view, prop, value,$model, tags) {
              var observer = new PathObserver($model,key);
              observer.open(function(newValue, oldValue){
                injectValue(view, prop, value, $model, tags);
              });
            }(view, prop,value, $model, tags));
          });
          if (tags[0] === value){
            var tag = tags[0];
            var  key = tag.substring(2,tag.length -2);
            (function($model, key, prop) {
              view.addEventListener("change", function(e) {
                setValue($model, key, e.source[prop]);
              });
            }($model, key, prop));
          }

        }
      }
    }
  };
}; 
