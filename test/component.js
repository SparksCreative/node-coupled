var hub = require('../lib/registry')
  , Component = require('../lib/component')
  , should = require('should');

describe('A component bound to the same context as another', function() {
    var registry
      , TestComponent
      , aContext = 'A Context'
      , payload = 'Payload'
      , a
      , b;

    beforeEach(function() {
        registry = hub.create('context-test');
        TestComponent = Component(registry, function(){});
        a = new TestComponent().setContext(aContext);
        b = new TestComponent().setContext(aContext);
    });

    afterEach(function() { hub.delete('context-test'); });

    describe('receives events from the other member when a listener is added to itself', function() {

        it('using the addListener function', function(done) {
            var event = 'An Event';

            a.addListener(event, function(received) {
                received.should.equal(payload);
                done();
            });

            b.emit(event, payload);
        });

        it('using the on function', function(done) {
            var event = 'Another Event';

            a.on(event, function(received) {
                received.should.equal(payload);
                done();
            });

            b.emit(event, payload);
        });

        it('from within the component constructor', function(done) {
            var event = 'A Third Event'
              , TestComponent2 = Component(registry, function() {
                    this.on(event, function(received) {
                        received.should.equal(payload);
                        done();
                    });
                });

            new TestComponent2().setContext(aContext);
            b.emit(event, payload);
        });

        it('before setting the context', function(done) {
            var event = 'Event 4'
              , d = new TestComponent();

            d.on(event, function(received) {
                received.should.equal(payload);
                done();
            });

            d.setContext(aContext);
            b.emit(event, payload);
        });
    });

    describe('may be constructed', function() {
        var Sender
          , Receiver;

        beforeEach(function() {
            Sender = Component(registry, function (eventName) {
                this.send = function(payload, done) {
                    this.emit(eventName, payload, done);
                };
            });
            Receiver = Component(registry, function(eventName) {
                this.on(eventName, function(received, done) {
                    received.should.equal(payload);
                    done();
                });
            });
        });

        it('sender first then receiver', function(done) {
            var context1 = 'Context 1'
              , event1 = 'Event 1';

            var sender = new Sender(event1).setContext(context1);
            new Receiver(event1).setContext(context1);
            sender.send(payload, done);
        });

        it('receiver first then sender', function(done) {
            var context2 = 'Context 2'
              , event2 = 'Event 2';

            new Receiver(event2).setContext(context2);
            new Sender(event2).setContext(context2).send(payload, done);
        });
    });
});

describe('Many components in a shared context', function() {
    var registry
      , GroupComponent
      , target = 5
      , counter;

    before(function() {
        registry = hub.create('context-test');
        GroupComponent  = Component(registry, function(context, done) {
            var self = this;
            self.setContext(context);
            self.receivedCount = 0;
            self.send = function(event, payload) { self.emit(event, payload); };
            self.on('SendCount', function() { if(++counter == target) done() });
            self.on('ReceiveCount', function() { if(++self.receivedCount == target) if(++counter == target) done(); });
        });
    });

    after(function() { hub.delete('context-test'); });

    beforeEach(function() { counter = 0; });

    it('send events to all other members', function(done) {
        var member;
        for(var i = 0; i < target; i++) member = new GroupComponent('SendCountContext', done);
        member.send('SendCount', 'Payload');
    });

    it('receive events from all other members', function(done) {
        var members = [];
        for(var i = 0; i < target; i++) members.push(new GroupComponent('ReceiveCountContext', done));
        members.forEach(function(member) { member.send('ReceiveCount', 'Payload'); });
    });
});
