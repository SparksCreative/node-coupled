var registry = require('./lib/registry').create('_coupled')
  , Component = require('./lib/component');



//===============
// Module exports
//===============

module.exports = function(target) {
    return Component(registry, target);
};
