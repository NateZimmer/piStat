var assert = require('assert');
require('../mocks/mocks');

describe('Full System', function() {
  describe('Load', function() {
    it('System should Load', function(done) {
        
        (async ()=>{

            require('../mocks/mocks');
            await require('../../src/run');
            setTimeout( ()=>{done();},1000);

        })();
        
    });
  });
});

