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
            done();
        });
    });

    after(function(done) {
        hub.delete('context-test', function() {
            done();
        });
    });

    describe('manage component members by listening on their events', function() {

        beforeEach(function(done) {
            registry.create('testContext', function(err, context) {
                testContext = context;
                TestComponent = Component(registry, function() {} );
                done();
            });
        });

        afterEach(function(done) {
            registry.delete('testContext', function() {
                done();
            });
        });

        it('consuming them when their context is set', function(done) {
            new TestComponent().setContext('testContext', function(err, instanceA) {
                Object.keys(testContext.members).length.should.equal(1);
                testContext.members[instanceA._componentId].should.equal(instanceA);
                done();
            });
        });

        it.skip('releasing them when their context is unset', function(done) {
            new TestComponent('Instance A').setContext('testContext', function(err, instance1) {
                Object.keys(testContext.members).length.should.equal(1);
                testContext.members[instance1._componentId].should.equal(instance1);

                instance1.setContext(null, function(err, instance2) {
                    should.not.exist(testContext.members[instance2._componentId]);
                    Object.keys(testContext.members).length.should.equal(0);
                    done();
                });
            });
        });
    });
});
