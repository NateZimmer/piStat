
var obj = {};

function getObjByValue(value, property, array){
    for(var i = 0; i < array.length; i++){
        // check that property is defined first
        if(typeof array[i][property] !== 'undefined') {
            // then check its value
            if(array[i][property] === value){
                return array[i];
            }
        }
    }
    return false;
}
obj.getObjByValue = getObjByValue;


function searchByValue(value, property, array){
    for(var i = 0; i < array.length; i++){
        // check that property is defined first
        if(typeof array[i][property] !== 'undefined') {
            // then check its value
            if(array[i][property] === value){
                return true;
            }
        }
    }
    return false;
}
obj.searchByValue = searchByValue;


getKeyByValue = function(obj,value ) {
    for( var prop in obj ) {
        if( obj.hasOwnProperty( prop ) ) {
             if( obj[ prop ] === value )
                 return prop;
        }
    }
}
obj.getKeyByValue = getKeyByValue;


function getNavPage(){

    var navItems = $('.navItem');
    var selectedItem = 0; 
    for(var i = 0; i < navItems.length; i++){
        if(navItems[i].style.color.includes('96')){
            selectedItem = i;
            break;
        }
    }
    return selectedItem;
}
obj.getNavPage = getNavPage;

function selectDivAbove(){

    var CDC = document.activeElement.classList.value;
    var TDE = document.activeElement.parentElement;
    var TDEC = '.'+TDE.classList.value; 
    var TTDE = TDE.parentElement;
    var pList = $(TTDE).find(TDEC);
    var indexNum = 0;
    for(var i = 0; i < pList.length; i++){
        if(pList[i]==TDE){
            indexNum = i;
            break;
        }
    }
    indexNum = (indexNum-1)<0 ? 0 : (indexNum-1); 
    var childItems = pList[indexNum].children;
    for(var i = 0; i < childItems.length; i++){
        if(childItems[i].classList.value == CDC){
            childItems[i].focus();
            var xx= childItems[i];
            console.log('Found Div Above');
        }
    }
}
obj.selectDivAbove = selectDivAbove;


function selectDivBelow(){
        var CDC = document.activeElement.classList.value;
        var TDE = document.activeElement.parentElement;
        var TDEC = '.'+TDE.classList.value; 
        var TTDE = TDE.parentElement;
        var pList = $(TTDE).find(TDEC);
        var indexNum = 0;
        for(var i = 0; i < pList.length; i++){
            if(pList[i]==TDE){
                indexNum = i;
                break;
            }
        }
        indexNum = (indexNum+1)>=pList.length ? indexNum : (indexNum+1); 
        var childItems = pList[indexNum].children;
        for(var i = 0; i < childItems.length; i++){
            if(childItems[i].classList.value == CDC){
                childItems[i].focus();
                var xx= childItems[i];
                console.log('Found Div Below');
            }
        }
}
obj.selectDivBelow = selectDivBelow;


function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
obj.setCookie = setCookie;


function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
obj.getCookie = getCookie;


function readCookie(name,source) {
    var nameEQ = name + "=";
    var ca = source.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
obj.readCookie = readCookie;


function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}
obj.deleteAllCookies = deleteAllCookies;


function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}
obj.eraseCookie = eraseCookie;

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

module.exports = obj;