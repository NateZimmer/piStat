// Thermal Model
// License: MIT


function thermal_step(u){
    this.temperature =  this.gain*this.dt*u/this.time_constant + this.temperature*(1 - this.dt/this.time_constant) + this.oat; 
}


function simple_thermal(obj){
    this.gain = obj.gain;
    this.temperature = obj.temperature;
    this.dt = obj.dt;
    this.oat = obj.oat;
    this.time_constant = obj.time_constant;
    this.step = thermal_step;
}

module.exports = simple_thermal;