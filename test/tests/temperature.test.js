var assert = require('assert');

describe('Temperature', function() {
  describe('Temperature Init', function() {
    it('It should be able to load module', function(done) {
        
        var mock = require('../mocks/bme280-sensor');
        require('../mocks/screen');
        var temperature = require('../../src/temperature');
        
        assert(temperature != undefined);
        setTimeout( ()=>{done();},500);
    });
  });
});