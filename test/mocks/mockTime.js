var mockTime = {};

var oldTimeout = setTimeout;


function sleep(ms){
    return new Promise(resolve=>{
        oldTimeout(resolve,ms)
    })
}
mockTime.sleep = sleep;


var lolex = require("lolex");
mockTime.lolex = lolex;


module.exports = mockTime;