// License: MIT

var state = require('./state.js');
var gpio = require('rpi-gpio');
var influx = require('./sendToInflux.js');
var gpiop = gpio.promise;
var screen = require('./screen_ui.js');

async function setup(){
	gpio.setup(state.upTempIO, gpio.DIR_IN, gpio.EDGE_FALLING);
    gpio.setup(state.downTempIO, gpio.DIR_IN, gpio.EDGE_FALLING);
    gpio.setup(state.modeChangeIO, gpio.DIR_IN, gpio.EDGE_FALLING);
    
    gpio.on('change', function(channel, value) {

        switch(channel){
            case state.upTempIO:
                console.log('[Info] User increased setpoint');
                changeSetPoint(1)
                break;
            case state.downTempIO: 
                console.log('[Info] User decreased setpoint');
                changeSetPoint(-1);
                break;
            default:
                    break;
        }

		console.log(`[Info] Changed State Channel:${channel}, Value: ${value}`);
		handleData(channel,value);
	});
	
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
    screen.drawSP();

}