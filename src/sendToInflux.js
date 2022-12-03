// Send To Influx 
// License: MIT

var fs = require('fs');
require('colors');
var path = require('path');
var debug = 0;

var config = {
    "influxURL" : "localhost",
    "dbName" : "db_name",
    "nginxURL" : "",
    "influxUser" : "db_user",
    "influxPassword" : "db_password",
    "port" : 8086,
    "https" : false
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function populate_config()
{
    var config_list = ["dbName","influxUser","influxPassword"];
    for(var property of config_list)
    {
        var value = config[property];
        if(process.env[value])
        {
            console.log(`Setting ${property} with env variable`);
            config[property] = process.env[value];
        }
        else
        {
            console.log(`Could not find ${value} env`);
        }
    }
}
populate_config();

if(config.https){ // User may wish to use HTTP/HTTPS
    var HTTP_S = require('https');
}else{
    var HTTP_S = require('http');
}

var ConfigDB = config.dbName;

var optionsInflux = {
    host: config.influxURL,
    port: config.port,
    path: '',
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    }
};  

var influx = {};

var sendN = 500; // Batch size to send to influx. Rest API can only handle so much
var ObjArray = [];
influx.ObjArray = ObjArray; // Expose Object Array  
influx.sendingData = false;
influx.disable = false;

// Use this to send to a different database than the default
function updateDatabaseName(databaseName){
    var pathText = config.nginxURL + '/write?db=' + databaseName + '&u=' + config.influxUser+ '&p=' + config.influxPassword;
    optionsInflux.path =  pathText;
}
influx.updateDatabaseName = updateDatabaseName; 
updateDatabaseName(ConfigDB);

var lastStringLength = 0;

function dlog(msg){
    debug ? console.log(msg) : null;
}

async function writeInfluxBatch(COVArray){
    return new Promise(async function (resolve, reject) {
        if(influx.disable){
            resolve('Done');
            return;
        }
        var ObjArray = JSON.parse(JSON.stringify(COVArray)); // Deep object array clone 
        var covCount = ObjArray.length;
        var batchCount = Math.floor(covCount/sendN)+1;
        for(var j = 0; j < batchCount; j++){
            var res = {'success':true};
            var covPack = [];
            covCount = ObjArray.length;
            if(covCount>=sendN){
                dlog('Sending '+sendN.toString() + ' messages to influxDB with '+ (covCount-sendN).toString()+' to go.');
                for(var i = 0; i < sendN; i++){
                    covPack.push(ObjArray[i]);
                }
                res = await writeInfluxPoints(covPack); // Send messages
                ObjArray.splice(0,sendN); // Remove batch values from array; 
            }
            else if( (covCount<sendN) && (covCount>0) ){
                dlog('Sending '+covCount.toString() + ' messages to influxDB');
                for(var i = 0; i < covCount; i++){
                    covPack.push(ObjArray[i]);
                }
                res = await writeInfluxPoints(covPack); // Send messages
                ObjArray.splice(0,covCount); // Should be size zero at this point 
            }
            else{
                dlog('Finished sending messages to influx db!');
                influx.sendingData = false;
                break;
            }
            if(res.success == false){
                console.log('[Error]'.red +' in batch' + j.toFixed(),res.msg);
            }
        }
        lastStringLength = 0;
        resolve('Done');
    });
}
influx.writeInfluxBatch = writeInfluxBatch;


// influxTagSanitize
// Replaces special characters in string that influx is senstive to. 
// Special characters include =,[space] 
function influxTagSanitize(influxString){
    var returnString =influxString;
    returnString = returnString.replaceAll('=','\\=');
    returnString = returnString.replaceAll(',','\\,');
    returnString = returnString.replaceAll(' ','\\ ');
    return returnString;
}

// This creates the influxdb REST string from an object array. 
// These objects take the form of the following 
// [{measurement:'', fields{...} , tags{...}, date:number}, ...]
function getInfluxString(objArray){
    var influxString = '';
    for(var i = 0; i < objArray.length; i++){
        var dateTemp = '';
        if(isNaN(objArray[i].date)){
            dateTemp = Date.parse(objArray[i].date);
            dateTemp = dateTemp*1000*1000; // Convert to ns timestamp epoch
        }else{
            dateTemp = parseInt(objArray[i].date);
        }

        influxString +=influxTagSanitize(objArray[i].measurement); 
        var objTags = Object.getOwnPropertyNames(objArray[i].tags);
        for(var j = 0; j < objTags.length; j++){
            influxString += ','+objTags[j]+'='+ influxTagSanitize(objArray[i].tags[objTags[j]]); 
        }
        influxString +=' ';
        var objFields = Object.getOwnPropertyNames(objArray[i].fields);
        for(var j = 0; j < objFields.length; j++){
            var fieldValue = objArray[i].fields[objFields[j]];
            fieldValue = (!isNaN(fieldValue)) ? fieldValue : '"' + fieldValue + '"'; // Handle if is a number & needs quotes versus numerical where no quotes are needed. 
            if(j < objFields.length - 1){
                influxString += objFields[j]+'='+fieldValue+',';
            }else{
                influxString += objFields[j]+'='+fieldValue;
            }
        }
        influxString +=' '+dateTemp.toString()+'\n';
    }
    return influxString;
}


// This creates a single HTTP(s) response to an influx REST interface. 
// Returns a promise which resolves upon completion/failure of the POST   
function writeInfluxPoints(objArray){
    return new Promise(function (resolve, reject) {
        var influxReq = HTTP_S.request(optionsInflux, function(response){
            if(response.statusCode==204){ // 204 is the success message from influxdb
                var response = {'success':true,'msg':'Message Success!'};
                resolve(response);
            }
            else{
                var failureText = response.rawHeaders.toString();
                var response = {'success':false,'msg':failureText}
                resolve(response);
            }
        });

        influxReq.on('error', function(err) {
            // handle errors with the request itself
            var response = {'success':false,'msg':err.message};
            resolve(response);
        });

        var influxString = getInfluxString(objArray);
        influxReq.write(influxString);
        influxReq.end();

    });
}

module.exports = influx;