// Screen UI
// License: MIT

var i2c = require('i2c-bus');
var i2cBus = i2c.openSync(1);
var oled = require('oled-i2c-bus');
var screen_lib = require('./screen_lib.js');;
var font = require('oled-font-5x7');
var os_lib = require('./os_lib.js');
var u = require('./util.js');
var state = require('./state.js');
var debug = 0;
var screen_ui = {};

// Screen opts
var opts = {
  width: 128,
  height: 64,
  address: 0x3C
};

// UI locations 
var side1 = 38;
var side2 = 87;
var greenH = 15;
var l2 = 44;
var timeH = 4;
var modeX = 95;
var netInfoHeight = 48;
var humidY = 18;
var humidX = 100;
var SpXLocation = humidX;
var SpYLocation = 27;
var tempY = 18;

var oled = new oled(i2cBus, opts);
screen_lib.extend(oled);

async function drawNetInfo(xPos,yPos,interface){
  var ssid = await os_lib.get_ssid(interface);
  ssid = ssid.substr(0,15);
  if(ssid ==''){
    console.log('[Warning]:No SSID found');
  }
  var nets = os_lib.getNetworkObjs();
  var ipStr = '';
  for(var net of nets){
    if(net.type.toLowerCase().includes(interface)){
      ipStr = net.ip;
      break;
    }
  }
  if(ipStr ==''){
    console.log('[Warning]:No IP found')
  }
  oled.setCursor(xPos,yPos);
  oled.writeString(font, 1, 'IP: ' + ipStr, 1, true);
  yPos +=8;
  oled.setCursor(xPos,yPos);
  oled.writeString(font, 1, 'SSID: ' + ssid, 1, true);  
}

function pad(num, size,padchar) {
  var s = num+"";
  while (s.length < size) s = padchar + s;
  return s;
}

function drawTime(xpos,ypos){
  oled.LETTERSPACING = 0;
  var dateN = new Date(Date.now());
  var hourStr = dateN.getHours();
  var timeStr = hourStr > 12 ? 'PM' : 'AM';
  var minStr = pad(dateN.getMinutes(),2,'0');
  hourStr = hourStr > 12 ? hourStr - 12 : hourStr;
  hourStr = hourStr == 0 ? 12 : hourStr;
  hourStr = pad(hourStr,2,' ');
  oled.setCursor(xpos,ypos);
  oled.writeString(font, 1, hourStr , 1, true);
  oled.setCursor(xpos+13,ypos);
  oled.writeString(font, 1, minStr , 1, true);
  oled.setCursor(xpos+24,ypos);
  oled.writeString(font, 1, timeStr , 1, true);
  oled.LETTERSPACING = 1;
}

async function drawTemp(){
  var temp = state.getProp('temperature');
  oled.centerTextWrite(font,tempY,temp.toFixed(1),3);
}
screen_ui.drawTemp = drawTemp;

async function drawHumidity(){
  var str = 'H:' + state.getProp('humidity').toFixed(0);
  oled.setCursor(humidX,humidY);
  oled.writeString(font, 1, str , 1, true);
}
screen_ui.drawHumidity = drawHumidity;

async function drawSP(){
  var str = 'S:' + state.getProp('activeSp').toFixed(0);
  oled.setCursor(SpXLocation,SpYLocation);
  if(state.getProp('mode') != 'Off'){
    oled.writeString(font, 1, str , 1, true);
  }else{
    oled.writeString(font, 1, '    ', 1, true);
  }
}
screen_ui.drawSP = drawSP;

function drawMode(){
  var mode = state.getProp('mode');
  oled.setCursor(modeX,timeH);
  mode = mode == 'Off' ? 'Off ' : mode;
  oled.writeString(font, 1, mode , 1, true);
}
screen_ui.drawMode = drawMode;

function drawLogo(){
  oled.centerTextWrite(font,0,'NAST',2);
  oled.drawLine(0, greenH, 127, greenH, 1); // --------------
  oled.drawLine(side1, 0, side1, greenH, 1); // | 
  oled.drawLine(side2, 0, side2, greenH, 1); // | 
  oled.drawLine(0, l2, 127, l2, 1); // ----------- 
}

async function drawUI(){

  oled.clearDisplay();
  drawLogo();
  await drawTemp();
  await drawNetInfo(0,netInfoHeight,'wlan0');
  drawHumidity();
  drawTime(0,timeH);
  drawMode();
  drawSP();
}
drawUI();

setTimeout(()=>{
  setInterval(()=>{
    drawTime(0,timeH);
    debug ? console.log('Updating Time') : null;
  },60*1000)
},5000)

module.exports = screen_ui;