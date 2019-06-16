// NZ
// License: MIT

var state = {};

state.temp = 70;
state.csp = 72;
state.hsp = 72;
state.modes = ['Off','Heat','Cool','Auto'];
state.mode = state.modes[0]; 
state.occStates = ['Home','Away'];
state.occState = state.occStates[0];
state.netSesne = 0;
state.netSesneEn = 0;
state.occSense = 0;
state.occSenseEn = 0;


module.exports = state;