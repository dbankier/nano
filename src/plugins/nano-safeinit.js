// Initialises and properties in template/expression that aren't in the $model
module.exports = function(options) {
  return function(nano) {
    nano.hook('model:bind', function(o, next) {
      if (o.$model[o.prop] === undefined) {
        var re = new RegExp(o.prop+"\\.");
        o.$model[o.prop] = o.expr.match(re) ? {} : "";
      }
      next();
    });
  };
};
