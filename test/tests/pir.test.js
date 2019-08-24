var assert = require('assert');
require('../mocks/mocks');

describe('PIR', function() {
  describe('PIR Init', function() {
    it('It should be able to load module', function(done) {
        
        (async ()=>{

            require('../mocks/gpio');
            var gpio = require('rpi-gpio');
            var mod = await require('../../src/pir.js');
            var state = require('../../src/state.js');
            gpio.emit('change', state.getProp('sensePin'), 1); // Simulate Occ Trigger 
            this.timeout(6000);
            var passed = state.getProp('occSense') == 1; 
            assert(passed);
            setTimeout( ()=>{done();},1000);

        })();
        
        //return 0;
        
    });
  });
});

