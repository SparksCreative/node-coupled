var hub = require('../lib/registry')
  , Component = require('../lib/component')
  , should = require('should');



describe('Registry instances', function() {

    it('are constructed with an identifying name', function() {
        hub.create('reg0', function(err, registry) {
            should.not.exist(err);
            registry.name.should.equal('reg0');
        });
    });

    it('are listed globally', function() {
        hub.create('reg1', function() {
            hub.list(function(err, list) {
                should.not.exist(err);
                list.length.should.equal(2);
                list[0].should.equal('reg0');
                list[1].should.equal('reg1');
            });
        });
    });

    it('may be referenced globally by their unique name', function() {
        hub.access('reg0', function(err, registry) {
            should.not.exist(err);
            registry.name.should.equal('reg0');
        });
    });

    it('may be deleted ', function() {
        hub.delete('reg0', function(err) {
            should.not.exist(err);

            hub.access('reg0', function(err, registry) {
                should.exist(err);
                should.not.exist(registry);
            });

            hub.list(function(err, list) {
                should.not.exist(err);
                list.length.should.equal(1);
                list[0].should.equal('reg1');
            });
        });
    });

    it('can not be deleted if they are not globally referenced', function() {
        hub.delete('reg0', function(err) {
            should.exist(err);
        });
    });

    describe('manage contexts', function() {
        var registry;

        beforeEach(function() { hub.create('reg1', function(err, reg) { registry = reg; }); });

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
            hub.create('reg1', function(err, reg) {
                registry = reg;
                TestComponent = Component(registry, function() {});
            });
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

        beforeEach(function() { hub.create('reg1', function(err, reg) { registry = reg; }); });

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
