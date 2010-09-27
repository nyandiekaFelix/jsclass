JS.Module = JS.makeClass();

JS.extend(JS.Module.prototype, {
  initialize: function(name, methods, options) {
    if (typeof name !== 'string') {
      options = arguments[1];
      methods = arguments[0];
      name    = undefined;
    }
    options = options || {};
    
    this.__nom__ = '';
    this.__inc__ = [];
    this.__dep__ = [];
    this.__fns__ = {};
    this.__tgt__ = options._target;
    
    this.include(methods);
  },
  
  setName: function(name) {
    this.__nom__ = this.displayName = name;
  },
  
  define: function(name, callable) {
    var method = JS.Method.create(this, name, callable);
    this.__fns__[name] = method;
    this.acceptMethod(name, method);
  },
  
  include: function(module) {
    if (!module) return;
    var field, value, mixins, i;
    
    if (module.__fns__ && module.__inc__) {
      this.__inc__.push(module);
      if (module.__dep__) module.__dep__.push(this);
      this.acceptModule(module);
      
      if (typeof module.included === 'function')
        module.included(this);
    }
    else {
      if (typeof module.extend !== 'function') {
        mixins = [].concat(module.extend);
        i = mixins.length;
        while (i--) this.extend(mixins[i]);
      }
      if (typeof module.include !== 'function') {
        mixins = [].concat(module.include);
        i = mixins.length;
        while (i--) this.include(mixins[i]);
      }
      for (field in module) {
        if (!module.hasOwnProperty(field)) continue;
        value = module[field];
        if (this.shouldIgnore(field, value)) continue;
        this.define(field, value);
      }
    }
    return this;
  },
  
  shouldIgnore: function(field, value) {
    return (field === 'extend' || field === 'include') &&
           typeof value !== 'function';
  },
  
  acceptMethod: function(name, method) {
    if (!method.name) return;
    if (this.__tgt__) this.__tgt__[name] = method.callable;
    var i = this.__dep__.length;
    while (i--) this.__dep__[i].acceptMethod(name, method);
  },
  
  acceptModule: function(module) {
    var fns = module.__fns__,
        inc = module.__inc__,
        field, i, n;
    
    for (i = 0, n = inc.length; i < n; i++)
      this.acceptModule(inc[i]);
    
    for (field in fns)
      this.acceptMethod(field, fns[field]);
  },
  
  instanceMethod: function(name) {
    return this.__fns__[name];
  }
});

