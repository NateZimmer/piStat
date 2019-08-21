var state = require('./state.js');
var screen = require('./screen_ui.js');
require('colors');

// Handles the screen and state aspects related to sensors  

var sense_ui = {};

sense_ui.handle_temp_update = (data) =>{
    if(Math.abs(state.getProp('temperature') - data) > state.getProp('temperature_cov')){
        state.updateState('temperature',data);
        screen.drawTemp();
    }    
} 

sense_ui.handle_humidity_update = (data) =>{
    if(Math.abs(state.getProp('humidity') - data) > state.getProp('humidity_cov')){
        state.updateState('humidity',data);
        screen.drawHumidity();
    }
}

module.exports = sense_ui;