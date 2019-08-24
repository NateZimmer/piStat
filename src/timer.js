// timer.js
// License: MIT

var timer = {};

timer.setTimeout = global.setTimeout;
timer.setInterval = global.setInterval;
timer.Date = global.Date;

module.exports = timer;