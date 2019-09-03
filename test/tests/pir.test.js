

jest.mock('../../src/sendToInflux')

test('Full System load', async function() { 

    var gpio = require('rpi-gpio');
    var mod = await require('../../src/pir.js');
    var state = require('../../src/state.js');
    console.log('Occ State is:' + state.getProp('occSense'));
    var passed = state.getProp('occSense') == 0; 
    gpio.emit('change', state.getProp('sensePin'), 1); // Simulate Occ Trigger 
    passed = passed && state.getProp('occSense') == 1; 
    expect(passed).toBe(true);
        
});

