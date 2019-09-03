//const i2c = jest.genMockFromModule('i2c-bus');

var i2c={};

i2c.openSync = ()=>{}

module.exports = i2c;

/*
function oled_i2c_bus(){
    this.a = 0;
    this.setCursor = ()=>{};
    this.writeString = ()=>{};
    this.clearDisplay = ()=>{};
    this.drawLine = ()=>{};
}
mock('oled-i2c-bus', oled_i2c_bus);
*/


