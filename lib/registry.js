var Context = require('./context')
  , EventEmitter=require('events').EventEmitter
  , util = require('util');

var contextCreatedEvent = 'context-created'
  , contextDeletedEvent = 'context-deleted'
  , contextSetEvent = 'context-set';

var noRegistryError = 'No registry exists with name %s'
  , noContextError = 'No Context exists in Registry "%s" with name "%s"'
  , setContextError = 'Error: set context %s on component %d: %s';

var registries = {};



//================
// Registry class
//================

function Registry(name) {
    var self = this;

    self.name = name;
    self.contexts = {};
    self.componentId = 0;


    // Context functions:
    // ------------------

    self.list = function(cb) {
        cb && cb(null, Object.keys(self.contexts));
    };

    self.access = function(name, cb) {
        if(self.contexts[name]) cb && cb(null, self.contexts[name][0]);
        else cb && cb(new Error(util.format(noContextError, self.name, name)));
    };

    self.create = function(name, cb) {
        self.access(name, function(err, context) {
            if(context) cb && cb(null, context);
            else {
                context = new Context(name);
                var listener = function(contextName, component, cb) {
                    contextName == context.name ? context.add(component, cb) : context.remove(component, cb);
                };
                self.on(contextSetEvent, listener);

                self.contexts[name] = [context, listener];
                self.emit(contextCreatedEvent, context);
                cb && cb(null, context);
            }
        });
    };

    self.delete = function(name, cb) {
        self.access(name, function(err, context) {
            if(err) cb && cb(err);
            else {
                self.removeListener(contextSetEvent, self.contexts[name][1]);
                delete self.contexts[name];
                self.emit(contextDeletedEvent, context);
                cb && cb(null);
            }
        });
    };


    // Component functions:
    // --------------------

    self.nextComponentId = function() {
        return ++self.componentId;
    };

    self.setContext = function(component, context) {
        self.create(context, function(err) {
            if(err) console.warn(setContextError, context, component.getComponentId(), err);
            else self.emit(contextSetEvent, context, component, function(err, name, size) {
                if(err) console.warn(setContextError, context, component.getComponentId(), err);
                else if(size == 0) self.delete(name);
            });
        });
    };
}

util.inherits(Registry, EventEmitter);



//===============
// Module exports
//===============

module.exports.list = function() {
    return Object.keys(registries);
};

module.exports.access = function(name) {
    return registries[name];
};

module.exports.create = function(name) {
    if(!registries[name]) registries[name] = new Registry(name);
    return registries[name];
};

module.exports.delete = function(name) {
    var registry = registries[name];
    if(registry) {
        Object.keys(registry.contexts).forEach(function(context) { registry.delete(context); });
        delete registries[name];
    }
};
