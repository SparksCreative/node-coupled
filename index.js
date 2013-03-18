//====================
// Module dependencies
//====================

var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , registry = {};



//===============
// Module exports
//===============

var component = exports.component = function(target) {
    util.inherits(target, Component);
    target.prototype._listeners = {};
    EventEmitter.call(target);
    return target;
};



//================
// Component class
//================

function Component() {}

util.inherits(Component, EventEmitter);

Component.prototype.remember = function(event, listener) {
    this._listeners[event] = listener;
};

Component.prototype.setContext = function(context) {
    return register(this, context);
};

Component.prototype.addListener = Component.prototype.on = function(event, listener) {
    this.remember(event, listener);

    getMembers(this.context, function(members) {
        members.forEach(function(member) {
            EventEmitter.prototype.addListener.call(member, event, listener);
        });
    });

    return EventEmitter.prototype.addListener.call(this, event, listener);
};



//=================
// Helper functions
//=================

var getMembers = function(context, cb) {
    if(context) {
        if(!registry[context]) registry[context] = [];
        cb(registry[context]);
    }
};

var register = function(component, context) {
    getMembers(context, function(members) {
        members.forEach(function(member) {
            Object.keys(component._listeners).forEach(function(event) {
                EventEmitter.prototype.addListener.call(member, event, component._listeners[event]);
            });

            Object.keys(member._listeners).forEach(function(event) {
                EventEmitter.prototype.addListener.call(component, event, member._listeners[event]);
            });
        });

        component.context = context;
        members.push(component);
    });

    return component;
};
