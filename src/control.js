// Control 
// License: MIT

var state = require('./state.js');
var gpio = require('rpi-gpio');
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
var H1 = createOutput({name:'heat1',affect:'Heat',pin: state.getProp('h1Pin'),enabled: state.getProp('h1_enabled')});
var C1 = createOutput({name:'cool1',affect:'Cool',pin: state.getProp('c1Pin'),enabled: state.getProp('c1_enabled')});


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
        if(output.value){
            changeOutputState(output,0);
            success = false;
        }   
    }
    return success;
}


function updateControlStatus(){

    var error =  state.getProp('temperature') - state.getProp('activeSp');
    switch( state.getProp('mode')){
        case 'Off': 
            break;
        case 'Heat':
            // Goal: Have positive error
            control.needed = error + controlDeadBand/2 < 0;
            control.satisfied = error - controlDeadBand/2 > 0;
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
    var minOnTime = output.affect == 'Heat' ? state.getProp('heatMinOnTime') : state.getProp('coolMinOnTime');
    var minOffTime = output.affect == 'Heat' ? state.getProp('heatMinOffTime') : state.getProp('coolMinOffTime');
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
        state.updateState(output.name,output.value);
    }

    return success;
}


setTimeout(()=>{
    console.log('[Control]'.purple + 'Starting Control Loop');
    setInterval(()=>{
        controlStateMachine();
    },state.getProp('controlTick'))
},state.getProp('controlDelay')*1000);
