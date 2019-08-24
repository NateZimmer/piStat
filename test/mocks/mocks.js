
// Contains all hardware mocks 


var mocks = {};

require('./gpio');
require('./bme280-sensor');
require('./screen');
mocks.t = require('./mockTime');
var state = require('../../src/state');

mocks.testSetup = ()=>{
    state.initStates();
    require('../../src/sendToInflux').disable = true;
}

module.exports = mocks;


