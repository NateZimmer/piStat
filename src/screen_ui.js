// NZ
// License: MIT


var i2c = require('i2c-bus');
var i2cBus = i2c.openSync(1);
var oled = require('./screen_lib.js');;
var font = require('oled-font-5x7');


var opts = {
  width: 128,
  height: 64,
  address: 0x3C
};


var oled = new oled(i2cBus, opts);
oled.clearDisplay();
oled.centerTextWrite(font, 1, 'Tom is a goat!');
