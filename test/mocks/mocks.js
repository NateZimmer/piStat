
// Contains all hardware mocks 


var mocks = {};

mocks.t = require('./mockTime');
jest.mock('../../src/sendToInflux');

module.exports = mocks;


