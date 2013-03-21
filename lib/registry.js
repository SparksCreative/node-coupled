var EventEmitter=require('events').EventEmitter
  , util = require('util');

var contextCreatedEvent = 'context-created'
  , contextDeletedEvent = 'context-deleted'
  , contextSetEvent = 'context-set'
  , newListenerEvent = 'newListener';

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

    self.setContext = function(component, contextName, cb) {
        self.create(contextName, function(err, context) {
            if(err) console.warn(setContextError, contextName, component.getComponentId(), err);
            else self.emit(contextSetEvent, contextName, component, function(err, name, size, component) {
                if(err) console.warn(setContextError, contextName, component.getComponentId(), err);
                else if(size == 0) self.delete(name);
            });
        });
    };
}

util.inherits(Registry, EventEmitter);



//================
// Context class
//================

function Context(name) {
    var self = this;
    self.name = name;
    self.members = {};


    // Component functions:
    // --------------------

    self.memberCount = function() {
        var size = 0, key;
        for (key in self.members) size++;
        return size;
    };

    self.add = function(component, cb) {
        var id = component.getComponentId();
        if(!self.members[id]) {
            component._context = self;
            self.bindComponents(component);
            self.members[id] = component;
        }
        cb && cb(null, name, self.memberCount(), component);
    };

    self.remove = function(component, cb) {
        var id = component.getComponentId();
        if(self.members[id]) {
            delete self.members[id];
            cb && cb(null, name, self.memberCount());
        }
    };


    // Listener functions:
    // -------------------

    // Called when a new listener has been added to a component already in this context:
    self.addListener = function(component, type, listener) {
        Object.keys(self.members).forEach(function(memberId) {
            if(memberId != component.getComponentId()) self.bindListener(type, listener, self.members[memberId]);
        });
    };

    // Bind all listeners between a pair of components or between all possible pairs of one component:
    self.bindComponents = function(a, b) {
        if(b) {
            self.bindComponent(a, b);
            self.bindComponent(b, a);
        } else Object.keys(self.members).forEach(function(memberId) {
            if(memberId != a.getComponentId()) self.bindComponents(a, self.members[memberId]);
        });
    };

    // Bind all listeners of a source component to a target component:
    self.bindComponent = function(source, target) {
        if(!source._events) source._events = {};
        Object.keys(source._events).forEach(function(type) {
            if(type != newListenerEvent) self.bindType(type, source._events[type], target);
        });
    };

    // Bind all listeners for one event of a source component to a target component:
    self.bindType = function(type, listeners, target) {
        if (Array.isArray(listeners)) listeners.forEach(function(listener) { self.bindListener(type, listener, target); });
        else self.bindListener(type, listeners, target);
    };

    // Bind one listener for one event of a source component to a target component:
    self.bindListener = function(type, listener, target) {
        if(!target._events) target._events = {};
        var targetListeners = target._events[type];
        if(Array.isArray(targetListeners)) { if(targetListeners.indexOf(listener) < 0) target.bindListener(type, listener); }
        else if (listener !== targetListeners) target.bindListener(type, listener);
    };
}


//===============
// Module exports
//===============

module.exports.list = function(cb) {
    cb && cb(null, Object.keys(registries));
};

var access = module.exports.access = function(name, cb) {
    if(registries[name]) cb && cb(null, registries[name]);
    else cb && cb(new Error(util.format(noRegistryError, name)));
};

module.exports.create = function(name, cb) {
    access(name, function(err, registry) {
        if(registry) cb && cb(null, registry);
        else cb && cb(null, registries[name] = new Registry(name));
    });
};

module.exports.delete = function(name, cb) {
    access(name, function(err) {
        if(err) cb && cb(err);
        else {
            var registry = registries[name];
            Object.keys(registry.contexts).forEach(function(context) { registry.delete(context); });
            delete registries[name];
            cb && cb(null);
        }
    });
};
