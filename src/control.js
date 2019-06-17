// Control 
// License: MIT

var state = require('./state.js');
var gpio = require('rpi-gpio');
var influx = require('./sendToInflux.js');
var gpiop = gpio.promise;

var control = {};
control.state = 'Off';
control.states = ['Off','Idle','Active','Satisfied']; 
control.satisfied = true;
control.needed = false;

var outputTemplate = {offStart:0,onStart:0,offTimeSat:1,onTimeSat:1,affect:'',value:0}

function createOutput(outObj){
    var obj = JSON.parse(JSON.stringify(outputTemplate));
    obj.offStart = Date.now();
    obj.onStart = Date.now();
    for(var el of outObj){
        obj[el] = outObj[el];
    }
    gpio.setup(obj.pin, gpio.DIR_OUT);
    control.outputs.push(obj);
    return obj;
};

control.outputs = [];
var H1 = createOutput({name:'H1',affect:'Heat',pin:25,enabled:state.h1_enabled});
var C1 = createOutput({name:'C1',affect:'Cool',pin:25,enabled:state.c1_enabled});


function controlStateMachine(){
    updateControlStatus();
    var stateChanged = false;
    if(state.mode == 'Off'){
        requestOutputsOff();
        if(control.state != 'Off'){
            stateChanged = 'Off';
        }
    }else{ // If mode is not off 
        if(control.state == 'Off'){
            stateChanged = 'Idle';
        }
        switch(control.state){
            case 'Idle':
                if(control.needed){
                    stateChanged = requestControlActive();
                    stateChanged = stateChanged ? 'Active' : stateChanged;
                }
                break;
    
                case 'Active':
                    if(control.satisfied){
                        stateChanged = requestOutputsOff();
                        stateChanged = stateChanged ? 'Satisfied' : stateChanged;
                    }
                    break;
    
                case 'Satisfied': 
                    if(control.needed){
                        stateChanged = 'Idle';
                    }
                    break;
    
            default:
                break;
        }
    }

    if(stateChanged != false){
        control.state = stateChanged;
        console.log('[Control]'.purple + 'Changed state to: ' + control.state.yellow);
    }
}

function requestControlActive(){
    var success = false;
    for(var output of control.outputs){
        if(output.affect == state.mode){
            success = changeOutputState(output,1);
            if(success){
                break;
            }
        }
    }
    return success;
}

function requestOutputsOff(){
    var success = true;
    for(var output of control.outputs){
        if(output.value){
            changeOutputState(output,0);
            success = false;
        }   
    }
    return success;
}


function updateControlStatus(){

    if(state.mode == 'Off'){
        return;
    }

    var error = state.temperature - state.activeSp;
    if(state.mode == 'Heat'){
        // Goal: Have positive error
        control.needed = error + controlDeadBand/2 < 0;
        control.satisfied = error - controlDeadBand/2 > 0;
    }

    if(state.mode == 'Cool'){
        // Goal: Have negative error 
        control.needed = error - controlDeadBand/2 > 0;
        control.satisfied = error + controlDeadBand/2 < 0;
    }

}


function changeOutputState(output,turnOn){
    var success = false;
    turnOn = turnOn ? 1 : 0;
    var minOnTime = output.affect == 'Heat' ? state.heatMinOnTime : state.coolMinOnTime;
    var minOffTime = output.affect == 'Heat' ? state.heatMinOffTime : state.coolMinOffTime;
    if(turnOn){
        if(output.offTimeSat){ // Safe to turn on 
            output.onStart = Date.now();
            output.onTimeSat = false;
            setTimeout(()=>{output.onTimeSat = true},minOnTime*1000);
            success = true;
        }
    }else{
        if(output.onTimeSat){ // Safe to turn off 
            output.offStart = Date.now();
            output.offTimeSat = false;
            setTimeout(()=>{output.offTimeSat = true},minOffTime*1000);
            success = true; 
        }
    }

    if(success){
        output.value = turnOn;
        gpiop.write(output.pin, output.value);
        console.log('[Control]'.purple + 'Changed value of output' + output.name.yellow + ' to ' + output.value.toString().yellow);
    }

    return success;
}


setTimeout(()=>{
    console.log('[Control]'.purple + 'Starting Control Loop');
    setInterval(()=>{
        controlStateMachine();
    },state.controlTick)
},state.controlDelay*1000)