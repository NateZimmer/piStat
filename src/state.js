// NZ
// License: MIT

var state = {};

state.temperature = 70;
state.humidity = 20;
state.csp = 72;
state.hsp = 72;
state.cspLimit = 50;
state.hspLimit = 99;
state.modes = ['Off','Heat','Cool','Auto'];
state.mode = state.modes[0]; 
state.occStates = ['Home','Away'];
state.occState = state.occStates[0];
state.netSesne = 0;
state.netSesneEn = 0;
state.occSense = 0;
state.occSenseEn = 0;
state.activeSp = state.csp;


// PINS

state.upTempIO = 13; // GPIO 27
state.downTempIO = 15; // GPIO 22
state.modeChangeIO = 16; // GPIO 23

module.exports = state;