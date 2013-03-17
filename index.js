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
    this.context = context;
    register(this, context);
    return this;
};

Component.prototype.on = function(event, listener) {
    var receiver = this;
    EventEmitter.prototype.on.call(receiver, event, listener);
    registry[receiver.context].forEach(function(component) {
        if(component != receiver) EventEmitter.prototype.on.call(component, event, function() {
            [].unshift.call(arguments, event);
            EventEmitter.prototype.emit.apply(receiver, Array.apply(null, arguments));
        });
    });
};



//=================
// Helper functions
//=================

var register = function(component, context) {
    if(!registry[context]) registry[context] = [];
    registry[context].push(component);
};



//===============
// Module exports
//===============

exports.component = function(target) {
    util.inherits(target, Component);
    EventEmitter.call(target);
    return target;
};
