var hub = require('../lib/hub')
  , Component = require('../lib/component')
  , should = require('should');

var registry
  , testContext
  , TestComponent;



describe('context instances', function() {

    before(function(done) {
        hub.create('context-test', function(err, reg) {
            registry = reg;
            TestComponent = Component(registry, function() {} );
            done();
        });
    });

    after(function(done) {
        hub.delete('context-test', function() {
            done();
        });
    });

    describe('manage component members by listening on component context events from the registry', function() {

        beforeEach(function(done) {
            registry.create('testContext', function(err, context) {
                testContext = context;
                done();
            });
        });

        afterEach(function(done) {
            registry.delete('testContext', function() {
                done();
            });
        });

        it('consuming components with matching contexts', function(done) {
            new TestComponent().setContext('testContext', function(err, instance) {
                Object.keys(testContext.members).length.should.equal(1);
                testContext.members[instance._componentId].should.equal(instance);
                done();
            });
        });

        it('releasing components with different contexts', function(done) {
            new TestComponent().setContext('testContext', function(err, instance) {
                Object.keys(testContext.members).length.should.equal(1);
                testContext.members[instance._componentId].should.equal(instance);

                instance.setContext(null, function(err, instance2) {
                    should.not.exist(testContext.members[instance2._componentId]);
                    Object.keys(testContext.members).length.should.equal(0);
                    done();
                });
            });
        });
    });
});
