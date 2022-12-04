var mock = require('mock-require');
const EventEmitter = require('events');
class GPIO extends EventEmitter {}
const gpio = new GPIO();

gpio.setup = ()=>{};
gpio.write = ()=>{}

gpio.promise = {
    setup: (pin,dir)=>{
        return new Promise(resolve=>{ resolve()});
    },
    write: (pin,value)=>{
        return new Promise(resolve=>{ resolve()});
    }
};

mock('rpi-gpio', gpio);
