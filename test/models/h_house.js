
var thermal = require('./thermal.js');

var myHouse = new thermal({
    gain:25,
    temperature: 60,
    dt: 10,
    oat: 50,
    time_constant: 3600
});

module.exports = myHouse;