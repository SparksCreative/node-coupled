var hub = require('../lib/registry')
  , Component = require('../lib/component')
  , should = require('should');



describe('Registry instances', function() {

    beforeEach(function() { hub.list().forEach(function(key) { hub.delete(key); }); });

    it('are constructed with an identifying name', function() {
        var registry = hub.create('reg0');
        should.exist(registry);
        registry.name.should.equal('reg0');
    });

    it('are listed globally', function() {
        hub.create('reg0');
        hub.create('reg1');

        var list = hub.list();
        list.length.should.equal(2);
        list[0].should.equal('reg0');
        list[1].should.equal('reg1');
    });

    it('may be referenced globally by their unique name', function() {
        hub.create('reg0');

        var registry = hub.access('reg0');
        should.exist(registry);
        registry.name.should.equal('reg0');
    });

    it('may be deleted ', function() {
        hub.create('reg0');
        hub.create('reg1');
        hub.delete('reg0');

        var registry = hub.access('reg0');
        should.not.exist(registry);

        var list = hub.list();
        list.length.should.equal(1);
        list[0].should.equal('reg1');
    });

    describe('manage contexts', function() {
        var registry;

        beforeEach(function() { registry = hub.create('reg1'); });

        afterEach(function() { hub.delete('reg1'); });

        it('by creating them', function(){
            registry.create('context0', function(err, context) {
                should.not.exist(err);
                context.name.should.equal('context0');
            });
        });

        it('by listing them', function(){
            registry.create('context0', function() {
                registry.create('context1', function() {
                    registry.list(function(err, list) {
                        should.not.exist(err);
                        list.length.should.equal(2);
                        list[0].should.equal('context0');
                        list[1].should.equal('context1');
                    });
                });
            });
        });

        it('by providing access to them', function(){
            registry.create('context0', function() {
                registry.access('context0', function(err, context) {
                    should.not.exist(err);
                    context.name.should.equal('context0');
                });
            });
        });

        it('by deleting them', function(){
            registry.create('context0', function() {
                registry.create('context1', function() {
                    registry.delete('context0', function(err) {
                        should.not.exist(err);

                        registry.access('context0', function(err, context) {
                            should.exist(err);
                            should.not.exist(context);
                        });

                        registry.list(function(err, list) {
                            should.not.exist(err);
                            list.length.should.equal(1);
                            list[0].should.equal('context1');
                        });
                    });
                });
            });
        });
    });

    describe('listen for components having their context set and', function() {
        var registry
          , TestComponent;

        beforeEach(function() {
            registry =hub.create('reg1');
            TestComponent = Component(registry, function() {});
        });

        afterEach(function() { hub.delete('reg1'); });

        it('create contexts when the first component is set for it', function() {
            var componentInstance = new TestComponent().setContext('ComponentContext');

            registry.access('ComponentContext', function(err, context) {
                should.not.exist(err);

                Object.keys(context.members).length.should.equal(1);
                context.members[componentInstance.getComponentId()].should.equal(componentInstance);
            });
        });

        it('remove contexts when the last component is unset from it', function() {
            var componentInstance = new TestComponent().setContext('ComponentContext');

            registry.access('ComponentContext', function(err, context) {
                componentInstance.setContext('Something else');

                registry.access('ComponentContext', function(err) {
                    should.exist(err);

                    should.not.exist(context.members[componentInstance.getComponentId()]);
                    Object.keys(context.members).length.should.equal(0);
                });
            });
        });
    });

    describe('send events', function() {
        var registry;

        beforeEach(function() { registry = hub.create('reg1'); });

        afterEach(function() { hub.delete('reg1'); });

        it('when contexts are created', function(done) {
            registry.once('context-created', function(context) {
                context.name.should.equal('context2');
                done();
            });

            registry.create('context2');
        });

        it('when contexts are deleted', function(done) {
            registry.once('context-deleted', function(context) {
                context.name.should.equal('context3');
                done();
            });

            registry.create('context3', function() {
                registry.delete('context3');
            });
        });
    });
});
