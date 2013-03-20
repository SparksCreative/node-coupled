var hub = require('../lib/hub')
  , Component = require('../lib/component')
  , should = require('should');



describe('Registry instances', function() {

    it('are constructed with an identifying name', function() {
        hub.create('reg0', function(err, registry) {
            should.not.exist(err);
            registry.name.should.equal('reg0');
        });
    });

    it('must have a unique name', function() {
        hub.create('reg0', function(err, registry) {
            should.exist(err);
            should.not.exist(registry);
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

        it('by creating them', function(){
            hub.access('reg1', function(err, registry) {
                registry.create('context0', function(err, context) {
                    should.not.exist(err);
                    context.name.should.equal('context0');
                });
            });
        });

        it('by ensuring they have unique names', function(){
            hub.access('reg1', function(err, registry) {
                registry.create('context0', function(err, context) {
                    should.exist(err);
                    should.not.exist(context);
                });
            });
        });

        it('by listing them', function(){
            hub.access('reg1', function(err, registry) {
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
            hub.access('reg1', function(err, registry) {
                registry.access('context0', function(err, context) {
                    should.not.exist(err);
                    context.name.should.equal('context0');
                });
            });
        });

        it('by deleting them', function(){
            hub.access('reg1', function(err, registry) {
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

    describe('send events', function() {

        it('when contexts are created', function(done) {
            hub.access('reg1', function(err, registry) {
                registry.once('context-created', function(context) {
                    context.name.should.equal('context2');
                    done();
                });

                registry.create('context2');
            });
        });

        it('when contexts are deleted', function(done) {
            hub.access('reg1', function(err, registry) {
                registry.once('context-deleted', function(context) {
                    context.name.should.equal('context3');
                    done();
                });

                registry.create('context3', function() {
                    registry.delete('context3');
                });
            });
        });

        it('when a component context is set', function(done) {
            hub.access('reg1', function(err, registry) {
                registry.once('context-set', function(component, context) {
                    component.name.should.equal('testComponent');
                    context.should.equal('testContext');
                    done();
                });

                var componentClass = Component(registry, function() { this.name = 'testComponent'; });
                new componentClass().setContext('testContext');
            });
        });
    });
});
