const BME280 = require('bme280-sensor');
var state = require('./state.js');
var sense_ui = require('./sense_ui.js');
var log = require('./log')
require('colors');


var debug = 0;
const options = {
  i2cBusNo   : 1, // defaults to 1
  i2cAddress : 0x76 // defaults to 0x77
};

var temp = {};


const bme280 = new BME280(options);

const readSensorData = () => {
  setInterval(()=>{

    bme280.readSensorData()
    .then((data) => {

      data.temperature_F = (9/5) * data.temperature_C + 32; // Convert C to F
      log.info( JSON.stringify(data),undefined,log.VERBOSE);
      sense_ui.handle_temp_update(data.temperature_F);
      sense_ui.handle_humidity_update(data.humidity);      
    })
    .catch((err) => {
      console.log('[ERROR]'.red + `BME280 read error: ${err}`);
    });

  },state.getProp('temperature_period'));

  
};

// Initialize the BME280 sensor
//
bme280.init()
  .then(() => {
    console.log('BME280 initialization succeeded');
    readSensorData();
  })
  .catch((err) => console.log('[ERROR]'.red +`BME280 initialization failed: ${err} `));

temp.bme280 = bme280;

module.exports = temp;