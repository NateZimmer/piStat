// Thermal Test
// License: MIT

require('../mocks/mocks');
var thermal = require('../models/thermal.js');
var db_control = require('../controllers/dead_band_controller.js');
var fs = require('fs');
var svg_plot = require('svg-plot');
var print_test = require('../print_test.js');
var assert = require('assert');
var path = require('path');

var describe_text_1 = 'Thermal Model'
var describe_text_2 = 'Thermal Model Control Test'
var it_text = 'Should control to within 2 deg of setpoint';


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
        svg_plot.plot(str, path.resolve('test/results/', fileName),'Time'); // Generate CSV File
        fs.writeFileSync( path.resolve('test/results/', fileName + '.csv'),str); // Write CSV File 

        describe(describe_text_1, function() {
            describe(describe_text_2, function() {
              it(it_text, function() {
                  var endTemp = results[results.length -1][2];
                  console.log(endTemp)
                  var test_passed = endTemp> myControl.setpoint - 2 && endTemp < myControl.setpoint + 2; 
                assert( test_passed  );
                print_test(describe_text_1,path.resolve('test/testResults.md'),test_passed, it_text);
              });
            });
        });


    }catch(e){
        console.log(e);
    }
}

runTest('testThermal');