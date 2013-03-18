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
                    var self = this;
                    self.setContext(context);
                    self.on(event, function(received) {
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
                var self = this;
                self.setContext(context);
                self.send = function(payload, done) {
                    self.emit(eventName, payload, done);
                };
            })
          , Receiver = coupler.component(function(context, eventName) {
                var self = this;
                self.setContext(context);
                self.on(eventName, function(received, done) {
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