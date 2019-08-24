var assert = require('assert');
var mocks = require('../mocks/mocks');

var model = require('../models/h_house');


describe('Sys Test', function() {

  describe('Sys Test No Control', function() {
    it('Temperature should decay to OAT', function(done) {
        
        
        (async ()=>{
            model.time_constant = 300;
            model.reset(70);
            mocks.testSetup();
            const BME280 = require('../../src/temperature').bme280;
            require('../../src/control').createOutputs();
            await require('../../src/run');
            var log = require('../../src/log');
            log.minLogLevel = log.MINIMAL;
            var state = require('../../src/state.js');
            this.timeout(600000);
            console.log('Beginning Loop');
            for(var i = 0; i < 360; i++){
                model.step(0);
                BME280.temperature_C =  (5/9)*(model.temperature-32);
                mocks.t.clock.tick(10000);
                await mocks.t.sleep(1);
                
            }
            var passed = Math.abs(state.getProp('temperature') - model.oat)<1;
            console.log(state.getProp('temperature'),model.oat);
            assert(passed);
            done();

        })();
        
    });
  });
});

