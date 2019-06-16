var oled = require('oled-i2c-bus');


oled.centerTextWrite = function(yPos,font,textStr,size){
	var xSize = oled.WIDTH;
	var strLen = textStr.length();
	var xSize = font.width;
	var centerX = xSize/2 - strLen*font.width/2 
	oled.setCursor(centerX, yPos);
	oled.writeString(font, size, textStr, 1, true);
}

module.exports = oled;