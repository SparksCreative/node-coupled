var newListenerEvent = 'newListener';



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

module.exports = Context;
