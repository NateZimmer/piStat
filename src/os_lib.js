// License: MIT
// OS Lib

var os = require('os');
var ping = require('ping');
const cp = require('child_process');
const publicIp = require('public-ip');
var debug = false; // Prints debug messages

var os_lib = {};

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

var cfg = {
    extra: ['-c', '1','-w','1'] // Linux only 
};


function getNetworkObjs(){
    var ifaces = os.networkInterfaces();
    var networkObjs = [];
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        
        ifaces[ifname].forEach(function (iface) {
          if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
          }
      
          if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            networkObjs.push({'type': ifname, 'alias': alias, 'ip':iface.address, 'MAC':'' });
          } else {
            // this interface has only one ipv4 address
            networkObjs.push({'type': ifname, 'alias': '', 'ip':iface.address, 'MAC':iface.mac });
          }
          ++alias;
        });
      });
      return networkObjs;
}
os_lib.getNetworkObjs = getNetworkObjs;

function pingIP(ipTemp){
    ping.sys.probe(ipTemp, function(isAlive){
        var msg = isAlive ? 'host ' + ipTemp + ' is alive' : 'host ' + ipTemp + ' is dead';
        debug ? console.log(msg) : null;
    },cfg);
}


os_lib.getPublicIp = async ()=>{
    var res = await publicIp.v4();
    return res;
}


function runCommand(cmd){
    return new Promise(async function (resolve) {
        var exec = cp.exec(cmd);
        var stdOut = '';
        exec.stdout.on('data', (data) => {
            stdOut += data;
        });

        exec.on('close', (code) => {
            debug ? console.log(`child process exited with code ${code}`) : null;
            debug ? console.log(`stdout: ${stdOut}`) : null;
            resolve(stdOut);
        }); 

        exec.on('error', function( err ){ 
            debug ? console.log(`child has had error ${err}`) : null;
        });

    });
}
os_lib.runCommand = runCommand;


async function get_ssid(interface){
    var result = await runCommand('iwconfig | grep ' + interface);
    result = result.match(/ESSID:".*"/g);
    result = result[0].split('"')[1]
    return result;
}
os_lib.get_ssid = get_ssid;

module.exports = os_lib;
