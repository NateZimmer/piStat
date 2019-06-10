// NZ 
// License: MIT
// Scans network, pumps MACs to influx

var os = require('os');
var ping = require('ping');
const cp = require('child_process');
var influx = require('./sendToInflux.js');
var debug = false; // Prints debug messages


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


function pingIP(ipTemp){
    ping.sys.probe(ipTemp, function(isAlive){
        var msg = isAlive ? 'host ' + ipTemp + ' is alive' : 'host ' + ipTemp + ' is dead';
        debug ? console.log(msg) : null;
    },cfg);
}


function sweepNetwork(ipStr){
    return new Promise(async function(resolve){
        var ipSplit = ipStr.split('.');
        var ipSub = ipSplit[0] + '.' + ipSplit[1] + '.' + ipSplit[2]+'.'
        console.log('Scanning IP: ' + ipSub + 'xxx');
    
        for(var i = 1; i < 255; i++){
            var ipTemp = ipSub + (i).toFixed();
            debug ? console.log('Scanning IP: ' + ipTemp) : null;
            pingIP(ipTemp);
            
            await sleep(5);
        }
        console.log('Finished scanning, waiting for arp table to resolve');
        await sleep(5000);
        var result = await runCommand('arp');
        await sleep(5000);
        result = await runCommand('arp');
        var MACs = parseMACs(result);
        var influxArray = [];

        if(Array.isArray(MACs)){
            for(var MAC of MACs){
                console.log(`Found MAC: ${MAC}`);
                var influxObj = {measurement: 'Read MACs', fields:{value:1} , tags:{MAC:MAC}, date: Date.now()*1000*1000};
                influxArray.push(influxObj);
            }
            influx.writeInfluxBatch(influxArray);
        }
        result = await runCommand('sudo ip -s -s neigh flush all');
        resolve('done');
    });
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


function parseMACs(arpOut){
    var regex = /..:..:..:..:..:../g;
    return arpOut.match(regex);
}


async function sweepNetworks(){
    var netObjs = getNetworkObjs();
    for(var netObj of netObjs){
        var ipStr = netObj.ip;
        var done = await sweepNetwork(ipStr);
    }
    console.log('Finished network sweep');
}


async function sweepLoop(){
    while(1){
        await sleep(60*1000);
        sweepNetworks();
    }
}

sweepNetworks();
sweepLoop();