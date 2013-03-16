var coupler = require('../')
  , util = require('util');

describe('components may be created', function() {

    function ComponentA() {}
    function ComponentB() {}

    util.inherits(ConponentA, coupler.Component);
    util.inherits(ConponentB, coupler.Component);


    describe('in the context of a particular set of events', function() {

        var a = new ComponentA().setContext('A Context')
          , b = new ComponentB().setContext('A Context');


        describe('such that', function() {

            it('known events are automatically received when emitted', function(done) {

                a.on('An Event', function(received) {
                    received.should.equal('Payload');
                    done();
                });
                b.emit('An Event', 'Payload');
            })
        })
    })
})