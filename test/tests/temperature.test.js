jest.mock('../../src/sendToInflux');

test('Load Temp Module', function() { 
        var temperature = require('../../src/temperature');
        var passed = temperature != undefined; 
        expect(passed).toBe(true);
});