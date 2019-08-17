// print_test.js
// License: MIT

var fs = require('fs');

function print_test(name, file_path , passed, text){
    var txt = '\r\n\r\n ----- \r\n\r\n ## ' + name + ' \r\n\r\n**Status:** ';
    txt += passed ? 'Passed' : 'Failed';
    txt += '\r\n\r\n**Description:** ' + text;
    txt += '\r\n\r\n ---- \r\n\r\n';
    fs.appendFileSync(file_path,txt);
}

module.exports = print_test;