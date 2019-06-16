// NZ 
// License: MIT

var screen_lib = {};


screen_lib.extend = function(oled){

	oled.centerTextWrite = function(font,yPos,textStr,size){
		var xSize = oled.WIDTH;
		var strLen = textStr.length;
		var strPixels = strLen*font.width*size + (strLen-1)*oled.LETTERSPACING;
		var centerX = Math.floor(xSize/2 - strPixels/2);
		oled.setCursor(centerX, yPos);
		oled.writeString(font, size, textStr, 1, true);
	}

}



module.exports = screen_lib;