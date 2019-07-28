// License: MIT

require('colors');

var t = () =>{
    var now = new Date();
    return '   ' + now.toLocaleDateString().cyan +' ' + now.toLocaleTimeString().cyan;
}

var d = () =>{return '    ' + (Date.now()/1000).toFixed(3).cyan;}

module.exports.info = (logStr,val)=>{
    val = val == null ? '' : val;
    console.log('[Info] '.green + logStr + ' ' + val.toFixed(3).yellow + d());
}

module.exports.error = (logStr,val)=>{
    val = val == null ? '' : val;
    console.log('[ERROR] '.red + logStr + ' ' + val.toFixed(3).yellow + d());
}



