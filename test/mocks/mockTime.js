
var lolex = require("lolex");
var timer = require('../../src/timer');


var mockTime = {};

mockTime.fixTimers = (clock) =>{
    console.log('Time Mocked')
    timer.setTimeout = clock.setTimeout;
    timer.setInterval = clock.setInterval;
    timer.Date = clock.Date;
    clock.interval = setInterval(()=>{
        clock.tick(10);
    },10)
}

mockTime.resetTimers = (clock) =>{
    timer.setInterval = global.setInterval;
    timer.setTimeout = global.setTimeout;
    clearInterval(clock.interval);
}

mockTime.lolex = lolex;

mockTime.sleep = (ms)=>{
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}


var clock = mockTime.lolex.createClock(0);
mockTime.fixTimers(clock);
mockTime.clock = clock;


module.exports = mockTime;



