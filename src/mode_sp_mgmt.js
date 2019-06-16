// License: MIT

var state = require('./state.js');
var gpio = require('rpi-gpio');
var influx = require('./sendToInflux.js');
var gpiop = gpio.promise;
var screen = require('./screen_ui.js');
var debug = 0;
var colors = require('colors');
var changeTimeout = 100;
var changeLock = false;
var enableAuto = false;

async function setup(){
	gpio.setup(state.upTempIO, gpio.DIR_IN, gpio.EDGE_FALLING);
    gpio.setup(state.downTempIO, gpio.DIR_IN, gpio.EDGE_FALLING);
    gpio.setup(state.modeChangeIO, gpio.DIR_IN, gpio.EDGE_FALLING);
    
    gpio.on('change', function(channel, value) {

        if(!changeLock){
            changeLock = true;
            switch(channel){
                case state.upTempIO:
                    changeSetPoint(1)
                    break;
                case state.downTempIO: 
                    changeSetPoint(-1);
                    break;
                case state.modeChangeIO: 
                    changeMode();
                    break;
                default:
                        break;
            }
            setTimeout(()=>{changeLock = false;},changeTimeout);
            debug ? console.log('[Info] '.green + `Changed State Channel:${channel}, Value: ${value}`) : null;
        }

	});
	debug ? console.log('Finished pin configuration') : null;
}


function changeMode(){
    var index = state.modes.indexOf(state.mode); 
    state.mode = state.modes[(index + 1) % state.modes.length];
    state.mode = state.mode == 'Auto' && !enableAuto ? 'Off' : state.mode;
    console.log('[Info] '.green + ' Mode changed: ' + state.mode.yellow);
    state.saveState(); 
    screen.drawMode();
    screen.drawSP();
}


function changeSetPoint(val){
    switch(state.mode){
        case 'Heat':
            state.hsp += val;
            state.hsp = state.hsp > state.hspLimit ? state.hspLimit : state.hsp; // Enforce High limit
            state.hsp = state.hsp < state.cspLimit ? state.cspLimit : state.hsp; // Enforce Low Limit
            state.activeSp = state.hsp;
            break;
        case 'Cool':
            state.csp += val;
            state.csp = state.csp < state.cspLimit ? state.cspLimit : state.csp;
            state.csp = state.csp > state.hspLimit ? state.hspLimit : state.csp;
            state.activeSp = state.csp;
            break;
        default:
            break; 
    }
    state.mode != 'Off' ? console.log('[Info] '.green + ' User changed setpoint to ' + state.activeSp.toString().yellow) : null;
    state.saveState();
    screen.drawSP();

}
setup();