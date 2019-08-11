// Thermal Test
// License: MIT

var thermal = require('./models/thermal.js');
var db_control = require('./controllers/dead_band_controller.js');
var fs = require('fs');
var svg_plot = require('svg-plot');

var myHouse = new thermal({
    gain:25,
    temperature: 60,
    dt: 10,
    oat: 50,
    time_constant: 3600
});

var myControl = new db_control({
    band:1,
    setpoint: 70,
    mode: 'Positive',
})


var simTime = 9001;

function testModel(controller,model){
    
    var results = [['Time','On','Temperature', 'Setpoint']]
    
    for(var i = 0; i < Math.round(simTime/model.dt); i++){
        var onVal = controller.on ? 68:63; // For plotting purposes
        results.push([i.toFixed()*model.dt,onVal, model.temperature,controller.setpoint]);
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
        svg_plot.plot(str,'results/' + fileName,'Time');
        fs.writeFileSync('results/' + fileName + '.csv',str);
    }catch(e){
        console.log(e);
    }
}

runTest('testThermal');