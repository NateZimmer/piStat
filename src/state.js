// NZ
// License: MIT

var beautify = require("json-beautify");
var fs = require('fs');
require('colors');
var influx = require('./sendToInflux.js');
var debug = false;

var stateFileName = 'device.json'
var state = {};
state.temperature = 70;
state.temperature_cov = 0.1;
state.temperature_period = 5000;
state.humidity = 1;
state.humidity_cov = 2;
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
state.f1_enabled = true; 
state.site_name = 'nate';


// PINS

state.upTempIO = 13; // GPIO 27
state.downTempIO = 15; // GPIO 22
state.modeChangeIO = 16; // GPIO 23
state.led_pin = 11; // GPIO 17
state.sensePin = 12; // GPIO 18

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


module.exports = state;