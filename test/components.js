var coupler = require('../');

describe('component instances bound to the same context', function() {
    var A = coupler.component(function () {})
      , B = coupler.component(function () {})
      , context = 'A Context'
      , a = new A().setContext(context)
      , b = new B().setContext(context);


    describe('receive events emitted from other context members', function() {
        var payload = 'Payload';

        it('when listeners are added', function(done) {
            var event = 'An Event';

            a.on(event, function(received) {
                received.should.equal(payload);
                done();
            });

            b.emit(event, payload);
        });

        it('even before setting the context', function(done) {
            var C = coupler.component(function () {})
              , c = new C()
              , event = 'Another Event';

            c.on(event, function(received) {
                received.should.equal(payload);
                done();
            });

            c.setContext(context);
            b.emit(event, payload);
        });
    });
});