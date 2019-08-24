var assert = require('assert');
var mocks = require('../mocks/mocks');

describe('Mode', function() {
  describe('Mode Press', function() {
    it('State should change to heat', function(done) {
        
        (async ()=>{

            var gpio = require('rpi-gpio');
            mocks.testSetup();
            await require('../../src/mode_sp_mgmt');
            var state = require('../../src/state.js');
            gpio.emit('change', state.getProp('modeChangeIO'), 1); 
            gpio.emit('change', state.getProp('modeChangeIO'), 0); 
            gpio.emit('change', state.getProp('modeChangeIO'), 1); 
            gpio.emit('change', state.getProp('modeChangeIO'), 0); 
            gpio.emit('change', state.getProp('modeChangeIO'), 1); 
            
            this.timeout(6000);
            var passed = state.getProp('mode') == 'Heat'; 
            console.log('Heat vs ' + state.getProp('mode') );
            assert(passed);
            setTimeout( ()=>{done();},1000);

        })();
        
    });
  });
});

