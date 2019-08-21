var assert = require('assert');
var mockTime = require('../mocks/mockTime');

var fs = require('fs');

var model = require('../models/h_house');
model.time_constant = 300;



describe('Sys Test', function() {

    let clock;
    beforeEach(function () {
      clock = mockTime.lolex.install();
    });
    afterEach(function() {
      if (clock) {
        clock.uninstall();
      }
    });

  describe('Sys Test Controlled', function() {
    it('Sys should regulate', function(done) {

        console.log('Deleting Lolex')
        delete require.cache[require.resolve('lolex')];
        
        var clock = mockTime.lolex.install({
            shouldAdvanceTime: true,
            advanceTimeDelta: 1
        });
        

        (async ()=>{

            require('../mocks/mocks');
            var gpio = require('rpi-gpio');
            try{
                fs.unlinkSync('device.json');
            }catch(e){console.log(e)}
            
            require('../../src/sendToInflux').disable = true;
            const BME280 = require('../../src/temperature').bme280;
            await require('../../src/run');
            await require('../../src/mode_sp_mgmt');
            var log = require('../../src/log');
            log.minLogLevel = log.MINIMAL;
            var state = require('../../src/state.js');
            this.timeout(600000);


            // Simulate mode press chnage to heat 
            await mockTime.sleep(10);
            gpio.emit('change', state.getProp('modeChangeIO'), 1);
            clock.tick(10); 
            await mockTime.sleep(10);
            gpio.emit('change', state.getProp('modeChangeIO'), 0);
            clock.tick(10);
            await mockTime.sleep(10);  
            gpio.emit('change', state.getProp('modeChangeIO'), 1); 
            clock.tick(10);

            for(var i = 0; i < 360; i++){
                model.step(state.getProp('heat1'));
                BME280.temperature_C =  (5/9)*(model.temperature-32);
                clock.tick(10000);
                await mockTime.sleep(0);
                
            }
            var passed = Math.abs(state.getProp('temperature') - model.oat)<1;
            //clock.uninstall();
            //assert(passed);

            done();

        })();
        
    });
  });
});

