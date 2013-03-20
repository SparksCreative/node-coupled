var EventEmitter=require('events').EventEmitter
  , util = require('util');

var registries = {};



//================
// Registry class
//================

function Registry(name) {
    var self = this;

    self.name = name;
    self.contexts = {};

    self.list = function(cb) {
        cb && cb(null, Object.keys(self.contexts));
    };

    self.access = function(name, cb) {
        if(self.contexts[name]) cb && cb(null, self.contexts[name][0]);
        else cb && cb(new Error(util.format('No Context exists in Registry "%s" with name "%s"', self.name, name)));
    };

    self.create = function(name, cb) {
        self.access(name, function(err, context) {
            if(context) cb && cb(null, context);
            else {
                context = new Context(name);
                var listener = function(contextName, component, cb) {
                    contextName == context.name ? context.add(component, cb) : context.remove(component, cb);
                };
                self.on('context-set', listener);

                self.contexts[name] = [context, listener];
                self.emit('context-created', context);
                cb && cb(null, context);
            }
        });
    };

    self.delete = function(name, cb) {
        self.access(name, function(err, context) {
            if(err) cb && cb(err);
            else {
                self.removeListener('context-set', self.contexts[name][1]);
                delete self.contexts[name];
                self.emit('context-deleted', context);
                cb && cb(null);
            }
        });
    };

    self.setContext = function(component, contextName, cb) {
        self.create(contextName, function(err, context) {
            if(err) cb && cb(err, component);
            else self.emit('context-set', contextName, component, function(err, name, size, component) {
                if(err) cb && cb(err);
                else {
                    if(size == 0) self.delete(name);
                    if(component) cb && cb(null, component);
                }
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

    self.memberCount = function() {
        var size = 0, key;
        for (key in self.members) size++;
        return size;
    };

    self.add = function(component, cb) {
        component.getComponentId(function(err, id) {
            if(err) cb && cb(err);
            else {
                if(!self.members[id]) self.members[id] = component;
                cb && cb(null, name, self.memberCount(), component);
            }
        });
    };

    self.remove = function(component, cb) {
        component.getComponentId(function(err, id) {
            if(err) cb && cb(err);
            else if(self.members[id]) {
                delete self.members[id];
                cb && cb(null, name, self.memberCount());
            }
        });
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
    else cb && cb(new Error(util.format('No registry exists with name %s', name)));
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
        else { delete registries[name]; cb && cb(null); }
    });
};
