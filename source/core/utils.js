(function() {
  this.JS = this.JS || {};
})();

JS.bind = function(method, object) {
  return function() {
    return method.apply(object, arguments);
  };
};

JS.extend = function(destination, source, overwrite) {
  if (!destination || !source) return destination;
  for (var field in source) {
    if (destination[field] === source[field]) continue;
    if (overwrite === false && destination.hasOwnProperty(field)) continue;
    destination[field] = source[field];
  }
  return destination;
};

// TODO inline this method and remove it
JS.isFn = function(object) {
  return typeof object === 'function';
};

JS.makeBridge = function(parent) {
  var bridge = function() {};
  bridge.prototype = parent.prototype;
  return new bridge();
};

JS.makeClass = function(parent) {
  parent = parent || Object;
  
  var constructor = function() {
    return this.initialize
         ? this.initialize.apply(this, arguments) || this
         : this;
  };
  constructor.prototype = JS.makeBridge(parent);
  
  constructor.prototype.constructor =
  constructor.prototype.klass = constructor;
  
  constructor.superclass = parent;
  if (parent.subclasses) parent.subclasses.push(constructor);
  
  return constructor;
};

