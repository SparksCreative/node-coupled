var EventEmitter=require('events').EventEmitter
  , util = require('util');

var newListenerEvent = 'newListener';



//====================
// Component prototype
//====================

function Component(registry, target) {
    util.inherits(target, EventEmitter);

    target.prototype._registry = registry;

    target.prototype.getComponentId = function() {
        if(!this._componentId) this._componentId = this._registry.nextComponentId();
        return this._componentId;
    };

    target.prototype.setContext = function(context) {
        this._registry.setContext(this, context);
        return this;
    };

    target.prototype.addListener = target.prototype.on = function(event, listener) {
        if(event != newListenerEvent && this._context) this._context.addListener(this, event, listener);
        return EventEmitter.prototype.addListener.call(this, event, listener);
    };

    target.prototype.bindListener = function(event, listener) {
        EventEmitter.prototype.addListener.call(this, event, listener);
    };

    return target;
}



//===============
// Module exports
//===============

module.exports = Component;
