var EventEmitter=require('events').EventEmitter
  , util = require('util');



//====================
// Component prototype
//====================

function Component() {}

util.inherits(Component, EventEmitter);

Component.prototype.setContext = function(context, cb) {
    this.emit('context-set', this, context);
    cb && cb(null, this);
};



//===============
// Module exports
//===============

module.exports.Component = Component;

module.exports.create = function(registry, target, cb) {
    util.inherits(target, Component);
    target.prototype.constructor = registry.initialise(target.prototype.constructor);
    cb && cb(null, target);
    return target;
};