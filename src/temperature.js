const BME280 = require('bme280-sensor');
var state = require('./state.js');
var screen = require('./screen_ui.js');
require('colors');


var debug = 0;
const options = {
  i2cBusNo   : 1, // defaults to 1
  i2cAddress : 0x77 // defaults to 0x77
};

const bme280 = new BME280(options);

const readSensorData = () => {
  bme280.readSensorData()
    .then((data) => {

      data.temperature_F = BME280.convertCelciusToFahrenheit(data.temperature_C);
      data.pressure_inHg = BME280.convertHectopascalToInchesOfMercury(data.pressure_hPa);
      
      debug ? console.log('[Data V]'.green + JSON.stringify(data)) : null;
      if(Math.abs(state.temperature - data.temperature_F) > state.temperature_cov){
        state.updateState('temperature',data.temperature_F);
        screen.drawTemp();
      }

      if(Math.abs(state.humidity - data.humidity) > state.humidity_cov){
        state.updateState('humidity',data.humidity);
        screen.drawHumidity();
      }

      setTimeout(readSensorData, state.temperature_period);
    })
    .catch((err) => {
      console.log('[ERROR]'.red + `BME280 read error: ${err}`);
      setTimeout(readSensorData, state.temperature_period);
    });
};

// Initialize the BME280 sensor
//
bme280.init()
  .then(() => {
    console.log('BME280 initialization succeeded');
    readSensorData();
  })
  .catch((err) => console.log('[ERROR]'.red +`BME280 initialization failed: ${err} `));