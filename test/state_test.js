var assert = require('assert');


describe('State', function() {
  describe('State Init', function() {
    it('It should be able to load state', function() {
        var state = require('../../src/state.js');
        assert(state != undefined);
    });
  });
});