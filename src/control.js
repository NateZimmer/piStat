// Control 
// License: MIT

var state = require('./state.js');
var s = state.props;
var gpio = require('rpi-gpio');
var gpiop = gpio.promise;
var timer = require('./timer');
require('colors');
var control = {};
control.state = 'Off';
control.states = ['Off','Idle','Active','Satisfied']; 
control.satisfied = true;
control.needed = false;

var outputTemplate = {offStart:0,onStart:0,offTimeSat:1,onTimeSat:1,affect:'',value:0}

function createOutput(outObj){
    var obj = JSON.parse(JSON.stringify(outputTemplate));
    obj.offStart = timer.Date.now() - 5*60*1000; // Allow outputs to turn on at boot
    obj.onStart = timer.Date.now() - 5*60*1000; // Allow outputs to turn on at boot
    for(var el in outObj){
        obj[el] = outObj[el];
    }
    gpio.setup(obj.pin, gpio.DIR_OUT);
    control.outputs.push(obj);
    return obj;
};

control.outputs = [];

control.createOutputs = ()=>{
    control.outputs = [];
    var H1 = createOutput({name:'heat1',affect:'Heat',pin: s.h1Pin,enabled: s.h1_enabled});
    var C1 = createOutput({name:'cool1',affect:'Cool',pin: s.c1Pin,enabled: s.c1_enabled});
}
control.createOutputs();


function controlStateMachine(){
    updateControlStatus();
    var stateChanged = false;
    if(state.getProp('mode') == 'Off'){
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
                }else if(control.satisfied){
                    stateChanged = 'Satisfied';
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
        state.updateState('state',control.state)
    }
}

function requestControlActive(){
    var success = false;
    for(var output of control.outputs){
        if(output.affect == state.getProp('mode')){
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
        if(state.getProp(output.name)){ // if output is on 
            changeOutputState(output,0);
            success = false;
        }
    }
    return success;
}


function updateControlStatus(){

    var error =  state.getProp('temperature') - state.getProp('activeSp');
    var controlDeadBand = state.getProp('controlDeadBand');
    switch(state.getProp('mode')){
        case 'Off': 
            break;
        case 'Heat':
            // Goal: Have positive error
            control.needed = error + controlDeadBand/2 < 0;
            control.satisfied = error - controlDeadBand/2 > 0;
            break;
        case 'Cool':
            // Goal: Have negative error 
            control.needed = error - controlDeadBand/2 > 0;
            control.satisfied = error + controlDeadBand/2 < 0;
            break;
        default:
            break;
    }

}


function changeOutputState(output,turnOn){
    var success = false;
    turnOn = turnOn ? 1 : 0;
    var minOnTime = output.affect == 'Heat' ? state.getProp('heatMinOnTime')  : state.getProp('coolMinOnTime');
    var minOffTime = output.affect == 'Heat' ? state.getProp('heatMinOffTime') : state.getProp('coolMinOffTime');
    if(turnOn){
        if(output.offTimeSat){ // Safe to turn on 
            output.onStart = timer.Date.now();
            output.onTimeSat = false;
            timer.setTimeout(()=>{output.onTimeSat = true},minOnTime*1000);
            success = true;
        }
    }else{
        if(output.onTimeSat){ // Safe to turn off 
            output.offStart = timer.Date.now();
            output.offTimeSat = false;
            timer.setTimeout(()=>{output.offTimeSat = true},minOffTime*1000);
            success = true; 
        }
    }

    if(success){
        output.value = turnOn;
        gpiop.write(output.pin, output.value);
        state.updateState(output.name,output.value);
    }

    return success;
}

console.log('Control loop init')
timer.setTimeout(()=>{
    console.log('[Control] '.magenta + 'Starting Control Loop');
    timer.setInterval(()=>{
        controlStateMachine();
    },s.controlTick)
},s.controlDelay*1000);

module.exports = control;