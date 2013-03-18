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

Component.prototype.on = Component.prototype.addListener = function(event, listener) {
    var component = this;

    if(component.context) bindContext(component, event);
    remember(component, event);

    return EventEmitter.prototype.addListener.call(component, event, listener);
};



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
        [].unshift.call(arguments, event);
        EventEmitter.prototype.emit.apply(target, arguments);
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
