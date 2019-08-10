// Thermal Test
// License: MIT

var thermal = require('/models/thermal.js');
var db_control = require('./controllers/dead_band_controller.js');
var fs = require('fs');

var myHouse = new thermal({
    gain:10,
    temperature: 60,
    dt: 1,
    oat: 50,
    time_constant: 3600
});

var myControl = new db_control({
    band:1,
    setpoint: 70,
    mode: 'Positive',
})


var simTime = 90001;

function testModel(controller,model){
    
    var results = [['On','Temperature', 'Setpoint']]
    
    for(var i = 0; i < simTime; i++){
        results.push([controller.on, model.temperature,model.setpoint]);
        model.step(controller.on);
        controller.control(model.temperature);        
    }
    return results;
}

function runTest(fileName){
    var results = testModel(myControl,myHouse);
    var str = '';

    for(var row of results){
        str = str + row.join(',') + '\r\n'; 
    }
    try{
        fs.writeFileSync(fileName,'results/db_thermal_test.txt');
    }catch(e){
        console.log(e);
    }
}