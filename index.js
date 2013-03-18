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
    return component;
};

Component.prototype.on = Component.prototype.addListener = function(event, listener) {
    var component = this;

    if(component.context) bind(component, event);
    else remember(component, event);

    return EventEmitter.prototype.addListener.call(component, event, listener);
};



//=================
// Helper functions
//=================

var register = function(component, context) {
    component.context = context;
    if(!registry[context]) registry[context] = [];
    if(component._coupler) component._coupler.forEach(function(event) { bind(component, event) });
    registry[context].push(component);
};

var bind = function(component, event) {
    registry[component.context].forEach(function(member) {
        if(member != component) EventEmitter.prototype.on.call(member, event, function() {
            [].unshift.call(arguments, event);
            EventEmitter.prototype.emit.apply(component, arguments);
        });
    });
};

var remember = function(component, event) {
    if(!component._coupler) component._coupler = [];
    component._coupler.push(event);
};



//===============
// Module exports
//===============

exports.component = function(target) {
    util.inherits(target, Component);
    EventEmitter.call(target);
    return target;
};
