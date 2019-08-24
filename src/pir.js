// Sense
// License: MIT

var gpio = require('rpi-gpio');
var state = require('./state.js');
var timer = require('./timer');
var gpiop = gpio.promise;
require('colors');

var changeLock = false;
var changeTimeout = 50;

async function setup(){
	var done = await gpiop.setup(state.getProp('led_pin'), gpio.DIR_OUT);
	done = await gpiop.write(state.getProp('led_pin'), false)
	gpio.setup(state.getProp('sensePin'), gpio.DIR_IN, gpio.EDGE_BOTH);

	gpio.on('change', function(channel, value) {
		if(!changeLock){
			if(channel == state.getProp('sensePin')){
				hande_PIR_data(value);
				timer.setTimeout(()=>{changeLock = false;},changeTimeout);
			}
		}
	});
	console.log('Finished')
}


function hande_PIR_data(value){
		gpio.write(state.getProp('led_pin'), value);
		value = value ? 1 : 0;
		state.updateState('occSense',value);
}


module.exports = setup()