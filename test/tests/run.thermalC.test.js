var assert = require('assert');
var mocks = require('../mocks/mocks');

var model = require('../models/h_house');




describe('Sys Test', function() {


  describe('Sys Test Controlled', function() {
    it('Sys should regulate temperature', function(done) {


        (async ()=>{

            var gpio = require('rpi-gpio');
            mocks.testSetup();
            const BME280 = require('../../src/temperature').bme280;
            await require('../../src/run');
            await require('../../src/mode_sp_mgmt');
            var log = require('../../src/log');
            log.minLogLevel = log.MINIMAL;
            var state = require('../../src/state.js');
            this.timeout(600000);

            model.time_constant = 1800;
            model.reset(65);

            // Simulate mode press chnage to heat 
            await mocks.t.sleep(10);
            gpio.emit('change', state.getProp('modeChangeIO'), 1);
            mocks.t.clock.tick(10); 
            await mocks.t.sleep(10);
            gpio.emit('change', state.getProp('modeChangeIO'), 0);
            mocks.t.clock.tick(10);
            await mocks.t.sleep(10);  
            gpio.emit('change', state.getProp('modeChangeIO'), 1); 
            mocks.t.clock.tick(10);

            for(var i = 0; i < 360; i++){
                model.step(state.getProp('heat1'));
                BME280.temperature_C =  (5/9)*(model.temperature-32);
                mocks.t.clock.tick(10000);
                await mocks.t.sleep(1);
            }
            var passed = Math.abs(state.getProp('temperature') - state.getProp('activeSp'))<1;
            console.log(state.getProp('temperature'),state.getProp('activeSp'))
            assert(passed);
            done();

        })();
        
    });
  });
});

