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
        if(self.contexts[name]) cb && cb(null, self.contexts[name]);
        else cb && cb(new Error(util.format('No Context exists in Registry "%s" with name "%s"', self.name, name)));
    };

    self.create = function(name, cb) {
        self.access(name, function(err, context) {
            if(context) cb && cb(new Error(util.format('Context already exists in Registry "%s" with name "%s"', self.name, name)));
            else {
                var newContext = new Context(name);
                self.emit('context-created', newContext);
                cb && cb(null, self.contexts[name] = newContext);
            }
        });
    };

    self.delete = function(name, cb) {
        self.access(name, function(err, context) {
            if(err) cb && cb(err);
            else {
                delete self.contexts[name];
                self.emit('context-deleted', context);
                cb && cb(null);
            }
        });
    };

    self.initialise = function(componentClass) {
        var instance = new componentClass();
        instance.addListener('context-set', function(component, context) {
            self.emit('context-set', component, context);
        });
        self.emit('component-created', instance);
        return instance;
    };
}

util.inherits(Registry, EventEmitter);



//================
// Context class
//================

function Context(name) {
    var self = this;
    self.name = name;
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
        if(registry) cb && cb(new Error(util.format('Registry already exists with name %s', name)));
        else cb && cb(null, registries[name] = new Registry(name));
    });
};

module.exports.delete = function(name, cb) {
    access(name, function(err) {
        if(err) cb && cb(err);
        else { delete registries[name]; cb && cb(null); }
    });
};
