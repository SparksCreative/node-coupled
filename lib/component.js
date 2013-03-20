var EventEmitter=require('events').EventEmitter
  , util = require('util')
  , crypto = require('crypto');



//====================
// Component prototype
//====================

module.exports = function(registry, target, cb) {
    util.inherits(target.prototype, EventEmitter);
    target.prototype._registry = registry;

    target.prototype.getComponentId = function(cb) {
        var self = this;
        if(self._componentId) {
            cb(null, self._componentId);
        }
        else crypto.pseudoRandomBytes(16, function(err, buf) {
            if(!err) self._componentId = buf.toString('hex');
            cb(err, self._componentId);
        });
    };

    target.prototype.setContext = function(context, cb) {
        this._registry.setContext(this, context, cb);
    };

    cb && cb(null, target);
    return target;
};
