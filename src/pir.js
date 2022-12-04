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
	done = await gpiop.write(state.getProp('led_pin'), true)
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
	gpio.write(state.getProp('led_pin'), !value); // Logic reversed on led pin  
	value = value ? 1 : 0;
	state.updateState('occSense',value);
	state.updateState('occ_state',state.props.occStates.indexOf('Home'));
	state.setProp('last_occ', Date.now());
}

function manage_occupancy()
{
	// Timeout occState to away based on occ_timeout
	timer.setInterval(()=>{
		if(state.props.occ_state == state.props.occStates.indexOf('Home'))
		{
			// Has occupancy expired? 
			if(Date.now() > (state.props.last_occ + state.props.occ_timeout))
			{
				state.updateState('occ_state', state.props.occStates.indexOf('Away'));
			}
		}
	},5000);
}
manage_occupancy();

module.exports = setup()