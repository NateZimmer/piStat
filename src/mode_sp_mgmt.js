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
	gpio.setup(state.getProp('upTempIO'), gpio.DIR_IN, gpio.EDGE_FALLING);
    gpio.setup(state.getProp('downTempIO'), gpio.DIR_IN, gpio.EDGE_FALLING);
    gpio.setup(state.getProp('modeChangeIO'), gpio.DIR_IN, gpio.EDGE_FALLING);
    
    gpio.on('change', function(channel, value) {

        if(!changeLock){
            changeLock = true;
            switch(channel){
                case state.getProp('upTempIO'):
                    changeSetPoint(1)
                    break;
                case state.getProp('downTempIO'): 
                    changeSetPoint(-1);
                    break;
                case state.getProp('modeChangeIO'): 
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

    var newMode = null;
    switch(state.getProp('mode')){
        case 'Off':
            newMode = 'Heat';
            break;
        case 'Heat':
            newMode = 'Cool';
            break;
        case 'Cool':
            newMode = enableAuto ? 'Auto' : 'Off';
            break;
        case 'Auto':
            newMode = 'Off';
        default:
            newMode = 'Off';
            break;
    }
    state.updateState('mode',newMode);
    state.saveState(); 
    screen.drawMode();
    screen.drawSP();
}


function changeSetPoint(val){
    switch(state.mode){
        case 'Heat':
            var hsp = state.getProp('hsp') + val;
            hsp = hsp > state.getProp('hspLimit') ? state.getProp('hspLimit') : hsp; // Enforce High limit
            hsp = hsp < state.getProp('cspLimit') ? state.getProp('cspLimit') : hsp; // Enforce Low Limit
            state.updateState('hsp',hsp);
            state.updateState('activeSp',hsp);
            break;
        case 'Cool':
            var csp = state.getProp('csp') + val;
            csp = csp < state.getProp('cspLimit') ? state.getProp('cspLimit') : csp;
            csp = csp > state.getProp('hspLimit') ? state.getProp('hspLimit') : csp;
            state.updateState('csp',csp);
            state.updateState('activeSp',csp);
            break;
        default:
            break; 
    }
    state.saveState();
    screen.drawSP();

}
setup();