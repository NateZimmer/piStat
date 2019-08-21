// NZ
// License: MIT

var beautify = require("json-beautify");
var fs = require('fs');
require('colors');
var influx = require('./sendToInflux.js');
var log = require('./log');
var debug = false;
var bootTime = Date.now();

var stateFileName = 'device.json'
var state = {};
var props = {};
state.props = props;
props.temperature = 70;
props.temperature_cov = 0.1;
props.temperature_period = 5000;
props.humidity = 1;
props.humidity_cov = 0.5;
props.csp = 72;
props.hsp = 72;
props.cspLimit = 50;
props.hspLimit = 99;
props.modes = ['Off','Heat','Cool','Auto'];
props.mode = {value: props.modes[0],values:['Off','Heat','Cool','Auto']}; 
props.occStates = ['Home','Away'];
props.occState = props.occStates[0];
props.netSesne = 0;
props.netSesneEn = 0;
props.occSense = 0;
props.occSenseEn = 0;
props.activeSp = props.csp;
props.heatMinOnTime = 30;
props.heatMinOffTime = 30;
props.coolMinOnTime = 60;
props.coolMinOffTime = 60;
props.controlDeadBand = 1;
props.controlTick = 1;
props.controlDelay = 5;
props.h1_enabled = true; 
props.c1_enabled = true; 
props.fan1_enabled = true; 
props.site_name = 'nate';
props.state = {value:'Off', values:['Off','Idle','Active','Satisfied']};
props.runTime = 0;
props.latitude = 0;
props.longitude = 0;
props.darkSkyKey = 'null';
props.outdoorAirTemperature = 72;

// PINS

props.upTempIO = 13; // GPIO 27
props.downTempIO = 15; // GPIO 22
props.modeChangeIO = 16; // GPIO 23
props.led_pin = 11; // GPIO 17
props.sensePin = 12; // GPIO 18
props.c1Pin = 19; // GPIO10
props.h1Pin = 21; // GPIO9
props.cool1 = 0;
props.heat1 = 0;
props.skipStateLoad = false;

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
        if( !fs.existsSync('./' +stateFileName) || props.skipStateLoad ){
            console.log('[Info] '.green + 'Creating ' + stateFileName + ' state file.')
            state.saveState();
        }else{
            var syncRead = fs.readFileSync(stateFileName,'utf8');
            var parseState = JSON.parse(syncRead);
            for(var el in parseState.props){
                state.props[el] = parseState.props[el];
            }
            state.saveState(); 
        }
    }catch(e){
        console.log('[Error]'.red,e);
    }
}
loadState();


// Initially for no COV
state.setProp = (propName,value)=>{
    if(typeof(state.props[propName]) == 'object'){
        state.props[propName].value = value;
    }else{
        state.props[propName] = value;
    }
}


state.getProp = (propName)=>{
    return typeof(state.props[propName])=='object' ? state.props[propName].value : state.props[propName];
}


state.getIndex = (propName)=>{
    var returnVal = 'Null';
    try{
        returnVal = typeof(state.props[propName])=='object' ? state.props[propName].values.indexOf(state.props[propName].value) : 'Null'
    }catch(e){
        console.log(e);
    }
    return returnVal;
}


// Updates the state
state.updateState = (prop,value)=>{
    
    if(state.props[prop] == undefined){
        console.log('[ERROR] '.red + 'Invalid state property: ' + prop.yellow);
        return;
    }
    var oldVal = state.getProp(prop); 
    state.setProp(prop,value);
    if( oldVal != value)
    {
        var val = typeof(value) == 'string' ? state.getIndex(prop) : value;
        log.cov(prop,val);
        var influxM = {measurement: prop, fields:{value:val} , tags:{site: state.props.site_name}, date: Date.now()*1000*1000};
        influx.writeInfluxBatch([influxM]);
    }
}


// Pumps up entire state
state.uploadState = ()=>{
    var influxArray = [];
    for(var el in state.props){
        if(typeof(state.props[el]) != 'function' && typeof(state.props[el]) != 'object'){
            influxArray.push({measurement: el, fields:{value:state.props[el]} , tags:{site: state.props.site_name}, date: Date.now()*1000*1000});
        }
    }
    influx.writeInfluxBatch(influxArray);
}
state.uploadState(); // Upload state upon boot



setInterval(()=>{
    console.log('[State] '.blue + 'Cloud state update');
    state.uploadState();
},1000*60*60*12); // Update state every 12 hours 


// Update runtime every 20 minutes 
setInterval(()=>{
    var runTime = (Date.now() - bootTime)/(1000*60*60);
    state.updateState('runTime',runTime);
},1000*60*20);

module.exports = state;