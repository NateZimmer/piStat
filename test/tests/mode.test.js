var assert = require('assert');
require('../mocks/mocks');

describe('Mode', function() {
  describe('Mode Init', function() {
    it('It should be able to load module', function(done) {
        
        (async ()=>{

            require('../mocks/mocks');
            await require('../../src/mode_sp_mgmt');
            setTimeout( ()=>{done();},100);

        })();
        
    });
  });
});

