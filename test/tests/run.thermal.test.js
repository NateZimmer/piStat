

jest.setTimeout(60000)

test('Sys Test No Control', async function() {
        var model = require('../models/h_house');
        var mocks = require('../mocks/mocks');

        model.time_constant = 300;
        model.reset(70);
        //mocks.testSetup();
        const BME280 = require('../../src/temperature').bme280;
        require('../../src/control').createOutputs();
        await require('../../src/run');
        var log = require('../../src/log');
        log.minLogLevel = log.MINIMAL;
        var state = require('../../src/state.js');
        console.log('Beginning Loop');
        
        for(var i = 0; i < 360; i++){
            model.step(0);
            BME280.temperature_C =  (5/9)*(model.temperature-32);
            mocks.t.clock.tick(10000);
            await mocks.t.sleep(1);
            
        }
        var passed = Math.abs(state.getProp('temperature') - model.oat)<1;
        console.log(state.getProp('temperature'),model.oat);
        expect(passed).toBe(true);

});

