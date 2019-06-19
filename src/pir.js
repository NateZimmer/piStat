// Sense
// License: MIT

var gpio = require('rpi-gpio');
var state = require('./state.js');
var gpiop = gpio.promise;
require('colors');

var changeLock = false;
var changeTimeout = 50;

async function setup(){
	var done = await gpiop.setup(state.led_pin, gpio.DIR_OUT);
	done = await gpiop.write(state.led_pin, false)
	gpio.setup(state.sensePin, gpio.DIR_IN, gpio.EDGE_BOTH);
	
	gpio.on('change', function(channel, value) {
		if(!changeLock){
			if(channel == state.sensePin){
				hande_PIR_data(value);
				setTimeout(()=>{changeLock = false;},changeTimeout);
			}
		}
	});
	
}


function hande_PIR_data(value){
		gpio.write(state.led_pin, value);
		value = value ? 1 : 0;
		state.updateState('occSense',value);
}


setup();