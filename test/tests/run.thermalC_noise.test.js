jest.setTimeout(60000)

describe('Sys Test', function() {

  describe('Sys Test Controlled', function() {
    test('Sys should regulate temperature', async function() {

            var mocks = require('../mocks/mocks');
            var model = require('../models/h_house');
            var svg_plot = require('svg-plot');
            var gpio = require('rpi-gpio');
            const BME280 = require('../../src/temperature').bme280;
            await require('../../src/run');
            await require('../../src/mode_sp_mgmt');
            var log = require('../../src/log');
            log.minLogLevel = log.MINIMAL;
            log.saveLog = true;
            var state = require('../../src/state.js');
            state.initStates();
            state.covState();

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

            for(var i = 0; i < 360*2; i++){
                model.step(state.getProp('heat1'));
                BME280.temperature_C =  (5/9)*(model.temperature-32)+Math.random()*0.5;
                mocks.t.clock.tick(10000);
                await mocks.t.sleep(0);
            }
            var passed = Math.abs(state.getProp('temperature') - state.getProp('activeSp'))<1;
            console.log(state.getProp('temperature'),state.getProp('activeSp'));
            state.covState();

            svg_plot.plot(log.totalLog,{
                fileName:'test/results/HeatControlNoise',
                timeKey:'Time',
                pivotCSV:true,
                pivotKey:'Point',
                pivotValue:'Value',
                y2List:['heat1'],
                includeList:['activeSp','temperature','heat1'],
                title: 'Heating Example: With Noise',
                y2Range:[0,3]
            });
            

            log.saveFile('myLog.csv');
            expect(passed).toBe(true);
        
    });
  });
});

