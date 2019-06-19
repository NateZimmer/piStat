// License: MIT

var state = require('./state.js');
var gpio = require('rpi-gpio');
var screen = require('./screen_ui.js');
var debug = 0;
require('colors');
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
    var mode = state.modes[(index + 1) % state.modes.length];
    mode = mode == 'Auto' && !enableAuto ? 'Off' : mode; // Auto not supported yet
    state.updateState('mode',mode);
    state.saveState(); 
    screen.drawMode();
    screen.drawSP();
}


function changeSetPoint(val){
    switch(state.mode){
        case 'Heat':
            var hsp = state.hsp + val;
            hsp = hsp > state.hspLimit ? state.hspLimit : hsp; // Enforce High limit
            hsp = hsp < state.cspLimit ? state.cspLimit : hsp; // Enforce Low Limit
            state.updateState('hsp',hsp);
            state.activeSp = state.hsp;
            break;
        case 'Cool':
            var csp = state.csp + val;
            csp = csp < state.cspLimit ? state.cspLimit : csp;
            csp = csp > state.hspLimit ? state.hspLimit : csp;
            state.updateState('csp',csp);
            state.activeSp = state.csp;
            break;
        default:
            break; 
    }
    state.saveState();
    screen.drawSP();

}
setup();