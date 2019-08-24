var assert = require('assert');
require('../mocks/mocks');

describe('Temperature', function() {
  describe('Temperature Init', function() {
    it('It should be able to load module', function(done) {
        
        var temperature = require('../../src/temperature');
        
        assert(temperature != undefined);
        setTimeout( ()=>{done();},500);
    });
  });
});