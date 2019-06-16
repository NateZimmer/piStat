// Sense
// License: MIT

var gpio = require('rpi-gpio');
var influx = require('./sendToInflux.js');
var gpiop = gpio.promise;

var LED_PIN = 11; // GPIO 17
var SENSE_PIN = 12; // GPIO 18


async function setup(){
	var done = await gpiop.setup(LED_PIN, gpio.DIR_OUT);
	done = await gpiop.write(LED_PIN, false)
	gpio.setup(SENSE_PIN, gpio.DIR_IN, gpio.EDGE_BOTH);
	
	gpio.on('change', function(channel, value) {
		console.log('Channel ' + channel + ' value is now ' + value);
		handleData(channel,value);
	});
	
}


function handleData(channel,value){
		var influxArray = [];
		var channelStr = 'channel_'+channel.toFixed();
		var done = gpiop.write(LED_PIN, value);
		value = value ? 1 : 0;
		var influxObj = {measurement: channelStr, fields:{value:value} , tags:{site:'nate'}, date: Date.now()*1000*1000};
		influxArray.push(influxObj);
		console.log('Sending points to influx');
		influx.writeInfluxBatch(influxArray);
}


setup();