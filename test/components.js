var coupler = require('../');

describe('A component bound to the same context as another', function() {
    var A = coupler.component(function () {})
      , B = coupler.component(function () {})
      , aContext = 'A Context'
      , a = new A().setContext(aContext)
      , b = new B().setContext(aContext)
      , payload = 'Payload';

    describe('receives events from the other member a listener is added to itself', function() {

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
              , C = coupler.component(function(context) {
                    this.setContext(context);
                    this.on(event, function(received) {
                        received.should.equal(payload);
                        done();
                    });
                });

            new C(aContext);
            b.emit(event, payload);
        });

        it('before setting the context', function(done) {
            var D = coupler.component(function () {})
              , d = new D()
              , event = 'Event 4';

            d.on(event, function(received) {
                received.should.equal(payload);
                done();
            });

            d.setContext(aContext);
            b.emit(event, payload);
        });
    });

    describe('may be constructed', function() {
        var Sender = coupler.component(function (context, eventName) {
                this.setContext(context);
                this.send = function(payload, done) {
                    this.emit(eventName, payload, done);
                };
            })
          , Receiver = coupler.component(function(context, eventName) {
                this.setContext(context);
                this.on(eventName, function(received, done) {
                    received.should.equal(payload);
                    done();
                });
            });

        it('sender first then receiver', function(done) {
            var context1 = 'Context 1'
              , event1 = 'Event 1'
              , sender = new Sender(context1, event1);
            new Receiver(context1, event1);
            sender.send(payload, done);
        });

        it('receiver first then sender', function(done) {
            var context2 = 'Context 2'
              , event2 = 'Event 2';
            new Receiver(context2, event2);
            var sender = new Sender(context2, event2);
            sender.send(payload, done);
        });
    });
});

describe('Many components in a shared context', function() {
    var target = 3
      , Component = coupler.component(function(context, done) {
            this.setContext(context);
            this.receivedCount = 0;
            this.send = function(event, payload) { this.emit(event, payload); }
            this.on('SendCount', function() { if(++counter == target) done() });
            this.on('ReceiveCount', function() { if(++this.receivedCount == target) if(++counter == target) done() });
        })
      , counter;

    beforeEach(function() { counter = 0; });

    it('send events to all other members', function(done) {
        var member;
        for(var i = 0; i < target; i++) member = new Component('SendCountContext', done);
        member.send('SendCount', 'Payload');
    });

    it('receive events from all other members', function(done) {
        var members = [];
        for(var i = 0; i < target; i++) members.push(new Component('ReceiveCountContext', done));
        members.forEach(function(member) { member.send('ReceiveCount', 'Payload'); });
    });
});