// prevents binding the view changes back to the model 
// if the view has a `oneway` attribute/property
module.exports = function(options) {
  return function(nano) {
    nano.hook('view:bind', function(o, next) {
      if(!o.view.oneway) {
        next();
      }
    });
  };
};
