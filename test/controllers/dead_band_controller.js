// Deadband controller 
// License: MIT


function control(control_var){
    var error = control_var - this.setpoint; 
    error = this.mode == 'Positive' ? -1*error : error;
    this.on = error > this.band/2 ? true : this.on; // Is control band exceeded?  
    this.on = error < -1*this.band/2 ? false : this.on; // Is the control band satisfied?
}


function db_controller(obj){
    this.band = obj.band;
    this.setpoint = obj.setpoint
    this.mode = obj.mode;
    this.on = false;
    this.control = control;
}

module.exports = db_controller;
