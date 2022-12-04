var mock = require('mock-require');

var i2c = {
    openSync:()=>{}
}
mock('i2c-bus', i2c);

function oled_i2c_bus(){
    this.a = 0;
    this.setCursor = ()=>{};
    this.writeString = ()=>{};
    this.clearDisplay = ()=>{};
    this.drawLine = ()=>{};
    this.turnOffDisplay = ()=>{};
    this.turnOnDisplay = ()=>{};
}
mock('oled-i2c-bus', oled_i2c_bus);



