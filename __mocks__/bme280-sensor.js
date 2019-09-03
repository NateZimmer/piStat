
function bme280(data){

    this.temperature_C = 0;
    this.humidity = 0;

    this.init = ()=>{
        return new Promise(resolve=>{ resolve()});
    }

    this.readSensorData = ()=>{
        return new Promise(resolve=>{ resolve({
            temperature_C: this.temperature_C,
            humidity : this.humidity
        })});
    }
}

module.exports = bme280;
