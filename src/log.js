// License: MIT

require('colors');


var log = {
    ERRORS_ONLY:0,
    MINIMAL:1,
    VERBOSE:3,
};

log.minLogLevel = 1


var t = () =>{
    var now = new Date();
    return '   ' + now.toLocaleDateString().cyan +' ' + now.toLocaleTimeString().cyan;
}

var d = () =>{return ',\t' + (Date.now()/1000).toFixed(3).cyan;}

log.info = (logStr,val,logLevel)=>{
    var valStr = typeof(val) == 'number' ?  val.toFixed(3) : ''; 
    var log_level = logLevel == undefined ? log.MINIMAL : logLevel;
    if(log.minLogLevel>=log_level){
        console.log('[Info], '.green + logStr + ' ' + valStr.yellow + d());
    }
}


log.cov = (point,val)=>{
    var valStr = typeof(val) == 'number' ?  val.toFixed(3) : typeof(val)=='string' ? val: ''; 
    if(log.minLogLevel>=log.MINIMAL){
        console.log('[COV],\t'.magenta + point.green + ',\t' + valStr.yellow + d());
    }
}


log.error = (logStr,val)=>{
    val = val == null ? '' : val;
    console.log('[ERROR] '.red + logStr + ' ' + val.toFixed(3).yellow + d());
}

module.exports = log;

