// OAT: Outdoor Air Temperature 
// License: MIT

var state = require('./state.js');
var s = state.props;
require('colors');
const https = require('https');
var debug = 0;


function OAT_ready(){
    var OAT_ready = false;
    do{
        if(s.latitude == 0){
            break;
        }
        if(s.longitude == 0){
            break;
        }
        if(s.darkSkyKey.length<10){
            break;
        }
        OAT_ready = true;
    }while(0);
    debug ? console.log('[Info] '.green + 'OAT is configured: ' + OAT_ready.toString().yellow) : null;
    return OAT_ready;
}


function getDarkURL(){
    var urlString = 'https://api.darksky.net/forecast/' + s.darkSkyKey + '/' + s.latitude + ',' + s.longitude;
    return urlString;
}


function updateOAT()
{
    var stringBuf='';
    var urlString = getDarkURL();
    https.get(urlString, (res) => {

    res.on('data', (d) => {
        stringBuf = stringBuf + d.toString();
    });

    res.on('end', () => {
        try
        {
            var weatherObj = JSON.parse(stringBuf);
            var tempOAT = weatherObj.currently.temperature;
            state.updateState('outdoorAirTemperature',tempOAT);

        } catch(e)
        {
            console.log('[Error] '.red + 'Failed parsing weather data');
        }
        stringBuf = '';
    });	

    }).on('error', (e) => {
        console.error('[Error] '.red,e);
    });

}


function start_OAT_sampling(){
    if( OAT_ready() ){
        updateOAT();
        setInterval(()=>{
            updateOAT();
        },60*60*1000)
    }
}

start_OAT_sampling();

