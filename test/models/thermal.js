// Thermal Model
// License: MIT


function thermal_step(u){
    this.delta =  this.gain*this.dt*u/this.time_constant + this.delta*(1 - this.dt/this.time_constant) ;
    this.temperature = this.delta + this.oat;
}


function simple_thermal(obj){
    this.gain = obj.gain;
    this.temperature = obj.temperature;
    this.dt = obj.dt;
    this.oat = obj.oat;
    this.time_constant = obj.time_constant;
    this.step = thermal_step;
    this.delta = this.temperature - this.oat;
}

module.exports = simple_thermal;