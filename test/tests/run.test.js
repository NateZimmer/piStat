require('../mocks/mocks');

test('Full System load', async function() { 

    await require('../../src/run');
    expect(1).toBe(1);

});

