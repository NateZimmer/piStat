var assert = require('assert');
var mockTime = require('../mocks/mockTime');


var model = require('../models/h_house');
model.time_constant = 300;


describe('Sys Test', function() {

    let clock;
    before(function () {
      clock = mockTime.lolex.install();
    });
    after(function () {
      if (clock) {
        clock.uninstall();
      }
    });


  describe('Sys Test No Control', function() {
    it('State should change to heat', function(done) {
        
        var clock = mockTime.lolex.install({
            shouldAdvanceTime: true,
            advanceTimeDelta: 1
        });

        
        (async ()=>{
 
            require('../mocks/mocks');
            require('../../src/sendToInflux').disable = true;
            var gpio = require('rpi-gpio');
            const BME280 = require('../../src/temperature').bme280;
            await require('../../src/run');
            var log = require('../../src/log');
            log.minLogLevel = log.MINIMAL;
            var state = require('../../src/state.js');
            this.timeout(600000);
            for(var i = 0; i < 360; i++){
                model.step(0);
                BME280.temperature_C =  (5/9)*(model.temperature-32);
                clock.tick(10000);
                await mockTime.sleep(1);
                
            }
            var passed = Math.abs(state.getProp('temperature') - model.oat)<1;
            console.log(state.getProp('temperature'),model.oat);
            assert(passed);
            done();

        })();
        
    });
  });
});

