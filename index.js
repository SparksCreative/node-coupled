//====================
// Module dependencies
//====================

var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , registry = {};



//================
// Component class
//================

function Component() {}

util.inherits(Component, EventEmitter);

Component.prototype.setContext = function(context) {
    var component = this;
    register(component, context);

    if(component._coupler) component._coupler.forEach(function(event) { bindContext(component, event) });
    registry[component.context].forEach(function(member) {
        if(member != component) member._coupler.forEach(function(event) { bindComponents(component, member, event) });
    });

    return component;
};

Component.prototype.addListener = Component.prototype.on = function(event, listener) {
    var component = this;

    if(component.context) bindContext(component, event);
    remember(component, event);

    return EventEmitter.prototype.addListener.call(component, event, listener);
};


// Hop marker object to place on emitted events.
// Prevents receipt of the same event multiple times when there are many members of a context.
// Doesn't resolve the combinatorial issue of delivering events though, will require a central event hub to be scalable.
function Hop() {}

//=================
// Helper functions
//=================

var remember = function(component, event) {
    if(!component._coupler) component._coupler = [];
    component._coupler.push(event);
};

var register = function(component, context) {
    component.context = context;
    if(!registry[context]) registry[context] = [];
    registry[context].push(component);
};

var bindContext = function(component, event) {
    registry[component.context].forEach(function(member) {
        if(member != component) bindComponents(member, component, event);
    });
};

var bindComponents = function(source, target, event) {
    if(source != target) EventEmitter.prototype.on.call(source, event, function() {
        if(arguments[arguments.length-1] instanceof Hop) {
            [].pop.call(arguments);
        } else {
            [].unshift.call(arguments, event);
            [].push.call(arguments, new Hop());
            EventEmitter.prototype.emit.apply(target, arguments);
        }
    });
};



//===============
// Module exports
//===============

exports.component = function(target) {
    util.inherits(target, Component);
    target.prototype._coupler = [];
    EventEmitter.call(target);
    return target;
};
