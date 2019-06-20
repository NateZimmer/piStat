// NZ
// License: MIT

var beautify = require("json-beautify");
var fs = require('fs');
require('colors');
var influx = require('./sendToInflux.js');
var debug = false;
var bootTime = Date.now();

var stateFileName = 'device.json'
var state = {};
state.temperature = 70;
state.temperature_cov = 0.1;
state.temperature_period = 5000;
state.humidity = 1;
state.humidity_cov = 0.5;
state.csp = 72;
state.hsp = 72;
state.cspLimit = 50;
state.hspLimit = 99;
state.modes = ['Off','Heat','Cool','Auto'];
state.mode = state.modes[0]; 
state.occStates = ['Home','Away'];
state.occState = state.occStates[0];
state.netSesne = 0;
state.netSesneEn = 0;
state.occSense = 0;
state.occSenseEn = 0;
state.activeSp = state.csp;
state.heatMinOnTime = 30;
state.heatMinOffTime = 30;
state.coolMinOnTime = 60;
state.coolMinOffTime = 60;
state.controlDeadBand = 1;
state.controlTick = 1;
state.controlDelay = 5;
state.h1_enabled = true; 
state.c1_enabled = true; 
state.fan1_enabled = true; 
state.site_name = 'nate';
state.state = 'off';
state.runTime = 0;

// PINS

state.upTempIO = 13; // GPIO 27
state.downTempIO = 15; // GPIO 22
state.modeChangeIO = 16; // GPIO 23
state.led_pin = 11; // GPIO 17
state.sensePin = 12; // GPIO 18
state.c1Pin = 19; // GPIO10
state.h1Pin = 21; // GPIO9
state.cool1 = 0;
state.heat1 = 0;

// Functions  

var queueSave = false;

function saveStateToDisk(){
    var jsonText = beautify(state, null, 2, 80);
    try{
        var syncWrite = fs.writeFileSync(stateFileName,jsonText);
    }catch(e){
        console.log('[Error]'.red,e);
    }
}

// Saves state to the disk
// Note this is rate limited to avoid too frequent saves 
// SD cards have limited write life
state.saveState = ()=>{
    if(!queueSave){
        queueSave = true;
        setTimeout(()=>{
            saveStateToDisk();
            queueSave = false;
            debug ? console.log('[Info] '.green + 'Saving state to disk') : null;
        },10*1000)
    }else{
        debug ? console.log('[Warn] '.yellow + 'Disk Rate Limit Hit') : null;
    }
}


function loadState(){
    try{
        if( !fs.existsSync('./' +stateFileName) ){
            console.log('[Info] '.green + 'Creating ' + stateFileName + ' state file.')
            state.saveState();
        }else{
            var syncRead = fs.readFileSync(stateFileName,'utf8');
            var parseState = JSON.parse(syncRead);
            for(var el in parseState){
                state[el] = parseState[el];
            }
        }
    }catch(e){
        console.log('[Error]'.red,e);
    }
}
loadState();


// Updates the state
state.updateState = (prop,value)=>{
    
    if(state[prop] == undefined){
        console.log('[ERROR] '.red + 'Invalid state property: ' + prop.yellow);
        return;
    }
    var oldVal = state[prop]; 
    state[prop] = value;
    if( oldVal != value)
    {
        console.log('[Info] '.green + 'State: ' + prop.yellow + ' value has changed to: ' + value.toString().yellow);
        var influxM = {measurement: prop, fields:{value:value} , tags:{site: state.site_name}, date: Date.now()*1000*1000};
        influx.writeInfluxBatch([influxM]);
    }
}


// Pumps up entire state
state.uploadState = ()=>{
    var influxArray = [];
    for(var el in state){
        if(typeof(state[el]) != 'function' && typeof(state[el]) != 'object'){
            influxArray.push({measurement: el, fields:{value:state[el]} , tags:{site: state.site_name}, date: Date.now()*1000*1000});
        }
    }
    influx.writeInfluxBatch(influxArray);
}
state.uploadState(); // Upload state upon boot

// Update runtime every 20 minutes 
setInterval(()=>{
    var runTime = (Date.now() - bootTime)/(1000*60*60);
    state.updateState('runTime',runTime);
},1000*60*20);


setInterval(()=>{
    console.log('[State] '.blue + 'Cloud state update');
    state.uploadState();
},1000*60*60*12); // Update state every 12 hours 


module.exports = state;