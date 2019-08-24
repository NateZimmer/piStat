var assert = require('assert');
require('../mocks/mocks');

describe('State', function() {
  describe('State Init', function() {
    it('It should be able to load state', function(done) {
        var state = require('../../src/state.js');
        this.timeout(6000);
        assert(state != undefined);
        setTimeout( ()=>{done();},5000);
    });
  });
});