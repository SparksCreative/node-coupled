var hub = require('../lib/registry')
  , Component = require('../lib/component')
  , should = require('should');

var registry
  , testContext
  , TestComponent;



describe('Context instances', function() {

    before(function() {
        registry = hub.create('context-test');
        TestComponent = Component(registry, function() {} );
    });

    after(function() { hub.delete('context-test'); });

    describe('manage component members by listening on component context events from the registry', function() {

        beforeEach(function() {
            registry.create('testContext', function(err, context) {
                testContext = context;
            });
        });

        afterEach(function() { registry.delete('testContext'); });

        it('consuming components with matching contexts', function() {
            var instance = new TestComponent().setContext('testContext');
            Object.keys(testContext.members).length.should.equal(1);
            testContext.members[instance.getComponentId()].should.equal(instance);
        });

        it('releasing components with different contexts', function() {
            var instance = new TestComponent().setContext('testContext');
            instance.setContext(null);
            should.not.exist(testContext.members[instance.getComponentId()]);
            Object.keys(testContext.members).length.should.equal(0);
        });
    });
});
