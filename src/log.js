// License: MIT

require('colors');
var fs = require('fs');
var timer = require('./timer');

var log = {
    ERRORS_ONLY:0,
    MINIMAL:1,
    VERBOSE:3,
};

log.minLogLevel = 1
log.saveLog=false;

log.totalLog = 'Event,Point,Value,Time,Info';

var t = () =>{
    var now = new timer.Date();
    return '   ' + now.toLocaleDateString().cyan +' ' + now.toLocaleTimeString().cyan;
}

var d = () =>{return ',\t' + (timer.Date.now()/1000).toFixed(3);}

log.info = (logStr,val,logLevel)=>{
    var valStr = typeof(val) == 'number' ?  val.toFixed(3) : ''; 
    var log_level = logLevel == undefined ? log.MINIMAL : logLevel;
    if(log.minLogLevel>=log_level){
        console.log('[Info], '.green + logStr + ' ' + valStr.yellow + d());
    }
}


log.cov = (point,val,extra)=>{
    var valStr = typeof(val) == 'number' ?  val.toFixed(3) : typeof(val)=='string' ? val: ''; 
    var extraStr = extra != null ? (',\t ' + extra) : ',';
    var extraLogStr = extra != null ? (',' + extra) : ',';
    var logStrColor = '[COV],\t'.magenta + point.green + ',\t' + valStr.yellow + d().cyan + extraStr;
    var logStr = '\r\n[COV],'+point + ',' + valStr +','+ (timer.Date.now()/1000).toFixed(3) +extraLogStr;
    if(log.minLogLevel>=log.MINIMAL){
        console.log(logStrColor);
    }
    if(log.saveLog){
        log.totalLog += logStr;
    }
}


log.saveFile = (fileName)=>{
    fs.writeFileSync(fileName,log.totalLog);
}


log.error = (logStr,val)=>{
    val = val == null ? '' : val;
    console.log('[ERROR] '.red + logStr + ' ' + val.toFixed(3).yellow + d());
}

module.exports = log;

